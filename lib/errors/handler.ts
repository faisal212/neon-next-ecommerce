import { AppError, ValidationError } from './api-error';

// Zod v4 uses ZodError — detect by checking for `issues` array
function isZodError(error: unknown): error is { issues: { message: string; path: (string | number)[] }[] } {
  return (
    error instanceof Error &&
    'issues' in error &&
    Array.isArray((error as Record<string, unknown>).issues)
  );
}

export function handleApiError(error: unknown): Response {
  if (isZodError(error)) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof ValidationError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? [],
        },
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.statusCode },
    );
  }

  console.error('Unhandled error:', error);
  return Response.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 },
  );
}
