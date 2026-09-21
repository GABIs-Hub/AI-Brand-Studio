import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'X-Request-Id';

/** Generates a server-owned correlation ID for every request. */
export function requestIdMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'DATABASE_ERROR'
  | 'BAD_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly publicMessage: string;

  constructor(statusCode: number, code: ApiErrorCode, publicMessage: string) {
    super(publicMessage);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.publicMessage = publicMessage;
  }
}

function getRequestId(res: Response): string {
  return typeof res.locals.requestId === 'string' ? res.locals.requestId : randomUUID();
}

export function sendApiError(
  res: Response,
  statusCode: number,
  code: ApiErrorCode,
  message: string
): void {
  const requestId = getRequestId(res);
  res.status(statusCode).json({ error: message, code, requestId });
}

/** Maps an internal error to a safe public response without exposing details. */
export function sendInternalApiError(res: Response, error: unknown, fallbackMessage: string): void {
  const requestId = getRequestId(res);
  console.error(`[API ${requestId}] Internal error:`, error);
  sendApiError(res, 500, 'INTERNAL_SERVER_ERROR', fallbackMessage);
}

export function apiErrorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const candidate = error as { type?: unknown; status?: unknown; statusCode?: unknown } | null;
  const isMalformedJson =
    candidate?.type === 'entity.parse.failed' ||
    (error instanceof SyntaxError && (candidate?.status === 400 || candidate?.statusCode === 400));

  if (isMalformedJson && req.path.startsWith('/api')) {
    sendApiError(res, 400, 'BAD_REQUEST', 'Request body must contain valid JSON.');
    return;
  }

  sendInternalApiError(res, error, 'An unexpected error occurred.');
}
