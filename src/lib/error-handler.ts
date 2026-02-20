/**
 * Enhanced Error Handling Utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorMessages = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  NOT_FOUND: 'Resource not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Invalid input. Please check your data.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FIRESTORE_ERROR: 'Database error. Please try again.',
  STORAGE_ERROR: 'Storage error. Please try again.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Firebase errors
    if (error.message.includes('PERMISSION_DENIED')) {
      return ErrorMessages.PERMISSION_DENIED;
    }
    if (error.message.includes('UNAUTHENTICATED')) {
      return ErrorMessages.AUTH_ERROR;
    }
    if (error.message.includes('NOT_FOUND')) {
      return ErrorMessages.NOT_FOUND;
    }
    if (error.message.includes('INVALID_ARGUMENT')) {
      return ErrorMessages.VALIDATION_ERROR;
    }
    if (error.message.includes('DEADLINE_EXCEEDED')) {
      return ErrorMessages.TIMEOUT;
    }

    return error.message || ErrorMessages.SERVER_ERROR;
  }

  return ErrorMessages.SERVER_ERROR;
}

export function logError(
  error: unknown,
  context?: { component?: string; action?: string; userId?: string }
) {
  console.error('[Error]', {
    error,
    context,
    timestamp: new Date().toISOString(),
  });

  // In production, send to error tracking service (Sentry)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry or similar service
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: { component?: string; action?: string }
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logError(error, context);
    return { error: errorMessage };
  }
}
