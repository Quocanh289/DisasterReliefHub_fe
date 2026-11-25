import { HttpErrorResponse } from '@angular/common/http';
import { LegacyErrorMessage, ProblemDetails } from '../models/api-error.model';

export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred.';
  }

  const body = error.error as ProblemDetails & LegacyErrorMessage | null;
  if (body?.errors) {
    const firstErrors = Object.values(body.errors).find((values) => values?.length);
    if (firstErrors?.[0]) return firstErrors[0];
  }
  if (body?.detail) return body.detail;
  if (body?.title) return body.title;
  if (body?.message) return body.message;

  const fallbacks: Record<number, string> = {
    400: 'The request is invalid.',
    401: 'Authentication is required or has expired.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'The request conflicts with the current resource state.',
    500: 'The server encountered an unexpected error.'
  };
  return fallbacks[error.status] ?? 'Unable to complete the request.';
}
