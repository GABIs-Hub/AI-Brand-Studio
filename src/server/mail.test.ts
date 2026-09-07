import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  makeVerifyLink,
  makeResetLink,
  buildVerifyEmail,
  buildResetEmail,
  sendMail,
} from './mail';

describe('mail link builders', () => {
  const originalAppUrl = process.env.APP_URL;

  afterEach(() => {
    if (originalAppUrl === undefined) delete process.env.APP_URL;
    else process.env.APP_URL = originalAppUrl;
  });

  it('builds verify links against APP_URL', () => {
    process.env.APP_URL = 'https://gabi.studio';
    const link = makeVerifyLink('Designer@Example.com', 'tok-123');
    expect(link).toBe('https://gabi.studio/?verify=tok-123&email=Designer%40Example.com');
  });

  it('builds reset links and defaults to localhost without APP_URL', () => {
    delete process.env.APP_URL;
    const link = makeResetLink('me@example.com', 'reset-abc');
    expect(link.startsWith('http://localhost:3000/?reset=reset-abc&email=me%40example.com')).toBe(
      true
    );
  });
});

describe('mail message builders', () => {
  it('builds a verification email containing the link and brand shell', () => {
    const msg = buildVerifyEmail('me@example.com', 'https://gabi.studio/?verify=t');
    expect(msg.to).toBe('me@example.com');
    expect(msg.subject).toMatch(/GABI/);
    expect(msg.html).toContain('Verify Email');
    expect(msg.html).toContain('https://gabi.studio/?verify=t');
    expect(msg.text).toContain('Verify Email: https://gabi.studio/?verify=t');
  });

  it('builds a reset email mentioning the one-hour expiry', () => {
    const msg = buildResetEmail('me@example.com', 'https://gabi.studio/?reset=t');
    expect(msg.subject).toMatch(/Reset your password/);
    expect(msg.text).toMatch(/expires in one hour/);
    expect(msg.html).toContain('Reset Password');
  });
});

describe('sendMail', () => {
  const originalKey = process.env.RESEND_API_KEY;
  const originalLog = console.log;

  beforeEach(() => {
    console.log = vi.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  });

  it('falls back to the console when no Resend key is set (dev flow stays testable)', async () => {
    delete process.env.RESEND_API_KEY;
    const msg = buildVerifyEmail('me@example.com', 'http://localhost:3000/?verify=t');
    const result = await sendMail(msg);
    expect(result.transport).toBe('console');
    expect(result.to).toBe('me@example.com');
    expect(console.log).toHaveBeenCalled();
  });

  it('delivers via the Resend REST API when a key is configured', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200 }) as any);
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendMail(buildResetEmail('me@example.com', 'http://localhost:3000/?reset=t'));
    expect(result.transport).toBe('resend');

    const call = fetchMock.mock.calls[0] as unknown as [string, { headers: Record<string, string>; body: string }];
    expect(String(call[0])).toBe('https://api.resend.com/emails');
    const init = call[1];
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(['me@example.com']);
    expect(body.from).toContain('GABI');
  });

  it('falls back to the console when Resend delivery fails so links are never lost', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    vi.stubGlobal('fetch', async () => ({ ok: false, status: 401, text: async () => 'unauthorized' }) as any);

    const result = await sendMail(buildVerifyEmail('me@example.com', 'http://localhost:3000/?verify=t'));
    expect(result.transport).toBe('console');
    expect(console.log).toHaveBeenCalled();
  });
});
