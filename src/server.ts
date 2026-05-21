import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders, applyCorsHeaders } from "./lib/security-headers";
import { rateLimitMiddleware, checkRateLimit, applyRateLimitHeaders } from "./lib/rate-limiter";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  const response = new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  return applySecurityHeaders(response);
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return applySecurityHeaders(response);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return applySecurityHeaders(response);

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return applySecurityHeaders(response);
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Apply rate limiting
      const rateLimitResponse = rateLimitMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 requests per window
      })(request);

      if (rateLimitResponse) {
        return applySecurityHeaders(rateLimitResponse);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);

      // Apply rate limit headers to successful responses
      const rateLimitResult = checkRateLimit(request, {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
      });

      return applyRateLimitHeaders(
        normalizedResponse,
        rateLimitResult.remaining,
        rateLimitResult.resetTime,
        100,
      );
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
