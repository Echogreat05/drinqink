/**
 * Security Headers Configuration
 * Implements OWASP recommended security headers for production
 */

export const securityHeaders = {
  // Content Security Policy - restricts sources of content
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.paystack.co wss://*.supabase.co",
    "frame-src 'self' https://js.paystack.co",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),

  // Prevent clickjacking attacks
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Enable XSS protection
  "X-XSS-Protection": "1; mode=block",

  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions policy (formerly Feature Policy)
  "Permissions-Policy": ["camera=()", "microphone=()", "geolocation=(self)", "payment=(self)"].join(
    ",",
  ),

  // Strict Transport Security (only for HTTPS)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * CORS configuration for API routes
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "https://sipcellar.com",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
