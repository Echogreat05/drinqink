/**
 * Rate Limiter Middleware
 * Implements in-memory rate limiting for API protection
 * For production, consider using Redis or a distributed cache
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";

  // Add user agent to make it more specific
  const userAgent = request.headers.get("user-agent") || "unknown";

  return `${ip}:${userAgent}`;
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = defaultConfig,
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpiredEntries();

  const clientId = getClientIdentifier(request);
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(clientId, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(clientId, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware for use in server handlers
 */
export function rateLimitMiddleware(config?: RateLimitConfig) {
  return (request: Request): Response | null => {
    const result = checkRateLimit(request, config);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(config?.maxRequests || defaultConfig.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetTime),
            "Retry-After": String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          },
        },
      );
    }

    // Add rate limit headers to successful requests
    return null; // Allow request to proceed
  };
}

/**
 * Apply rate limit headers to a response
 */
export function applyRateLimitHeaders(
  response: Response,
  remaining: number,
  resetTime: number,
  maxRequests: number,
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", String(maxRequests));
  headers.set("X-RateLimit-Remaining", String(remaining));
  headers.set("X-RateLimit-Reset", String(resetTime));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
