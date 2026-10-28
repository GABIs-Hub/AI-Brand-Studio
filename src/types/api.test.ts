import { describe, expect, it } from 'vitest';
import { isApiErrorResponse } from './api';

describe('API contracts', () => {
  it('recognizes the stable public error response', () => {
    expect(isApiErrorResponse({
      error: 'Request body must contain valid JSON.',
      code: 'BAD_REQUEST',
      requestId: 'request-123',
    })).toBe(true);
  });

  it('rejects malformed or unknown error responses', () => {
    expect(isApiErrorResponse({ error: 'bad', code: 'SECRET_INTERNAL_CODE', requestId: 'x' })).toBe(false);
    expect(isApiErrorResponse({ error: 'bad', code: 'BAD_REQUEST' })).toBe(false);
    expect(isApiErrorResponse(null)).toBe(false);
  });
});
