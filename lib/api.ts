import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiOk<T>(data: T, init?: number) {
  return NextResponse.json({ ok: true, data }, { status: init ?? 200 });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

/**
 * Normalizes unknown errors into a safe API response.
 * Never leaks stack traces, raw database errors, or internal details.
 */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return apiError("Invalid input", 400, err.flatten().fieldErrors);
  }

  if (err instanceof SyntaxError) {
    return apiError("Invalid JSON body", 400);
  }

  if (err && typeof err === "object" && "code" in err && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern ?? { field: 1 })[0];
    return apiError(`This ${field} is already taken`, 409);
  }

  if (err instanceof Error && err.message.includes("MONGODB_URI")) {
    return apiError("Service is temporarily unavailable", 503);
  }

  console.error(err);
  return apiError("Something went wrong. Please try again.", 500);
}
