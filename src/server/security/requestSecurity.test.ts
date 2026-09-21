import { describe, expect, it, vi } from 'vitest';
import {
  apiErrorMiddleware,
  requestIdMiddleware,
  sendApiError,
  REQUEST_ID_HEADER,
} from './requestSecurity';

function makeResponse() {
  const headers = new Map<string, string>();
  const response = {
    locals: {} as Record<string, unknown>,
    headersSent: false,
    status: vi.fn(function status(this: typeof response) {
      return this;
    }),
    json: vi.fn(),
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
  };
  return { response, headers };
}

describe('request security', () => {
  it('generates and exposes a server-owned request ID', () => {
    const { response, headers } = makeResponse();
    const next = vi.fn();

    requestIdMiddleware({} as never, response as never, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.locals.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers.get(REQUEST_ID_HEADER)).toBe(response.locals.requestId);
  });

  it('returns stable error metadata while preserving the string error contract', () => {
    const { response } = makeResponse();
    response.locals.requestId = 'request-123';

    sendApiError(response as never, 400, 'BAD_REQUEST', 'Bad request.');

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: 'Bad request.',
      code: 'BAD_REQUEST',
      requestId: 'request-123',
    });
  });

  it('sanitizes malformed JSON errors', () => {
    const { response } = makeResponse();
    response.locals.requestId = 'request-456';

    apiErrorMiddleware(
      Object.assign(new SyntaxError('Unexpected token at /private/path'), {
        type: 'entity.parse.failed',
        status: 400,
      }),
      { path: '/api/brands' } as never,
      response as never,
      vi.fn()
    );

    expect(response.json).toHaveBeenCalledWith({
      error: 'Request body must contain valid JSON.',
      code: 'BAD_REQUEST',
      requestId: 'request-456',
    });
    expect(JSON.stringify(response.json.mock.calls[0])).not.toContain('/private/path');
  });

  it('does not expose internal errors', () => {
    const { response } = makeResponse();
    response.locals.requestId = 'request-789';
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    apiErrorMiddleware(
      new Error('database password=secret stack /private/path'),
      { path: '/api/brands' } as never,
      response as never,
      vi.fn()
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: 'An unexpected error occurred.',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: 'request-789',
    });
    expect(JSON.stringify(response.json.mock.calls[0])).not.toContain('database password');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
