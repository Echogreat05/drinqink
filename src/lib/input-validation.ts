/**
 * Input Validation Middleware
 * Provides validation utilities for request data
 */

import { z } from "zod";

/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  url: z.string().url("Invalid URL"),
  uuid: z.string().uuid("Invalid UUID"),
  positiveNumber: z.number().positive("Value must be positive"),
  nonEmptyString: z.string().min(1, "Value cannot be empty"),
};

/**
 * Validate request body against a schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    return { success: false, errors: new z.ZodError([]) };
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, params: URLSearchParams): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const obj = Object.fromEntries(params.entries());
  return validateBody(schema, obj);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize request data
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  sanitized?: T;
} {
  const validation = validateBody(schema, data);

  if (!validation.success) {
    return validation;
  }

  if (validation.data && typeof validation.data === "object") {
    const sanitized = sanitizeObject(validation.data as Record<string, unknown>);
    return { success: true, data: validation.data, sanitized: sanitized as T };
  }

  return { success: true, data: validation.data, sanitized: validation.data };
}

/**
 * Create a validation error response
 */
export function createValidationError(errors: z.ZodError): Response {
  const formattedErrors = errors.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return new Response(
    JSON.stringify({
      error: "Validation failed",
      details: formattedErrors,
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

/**
 * Middleware to validate request body
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<Response | null> => {
    try {
      const contentType = request.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        return new Response(
          JSON.stringify({
            error: "Invalid content type",
            message: "Content-Type must be application/json",
          }),
          {
            status: 415,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const data = await request.json();
      const validation = validateAndSanitize(schema, data);

      if (!validation.success) {
        return createValidationError(validation.errors!);
      }

      // Check for SQL injection in string fields
      if (validation.data && typeof validation.data === "object") {
        for (const value of Object.values(validation.data as Record<string, unknown>)) {
          if (typeof value === "string" && containsSqlInjection(value)) {
            return new Response(
              JSON.stringify({
                error: "Invalid input",
                message: "Input contains potentially harmful content",
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
        }
      }

      return null; // Allow request to proceed
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          message: "Failed to parse request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}
