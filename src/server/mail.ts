// ── GABI transactional email (Resend) ─────────────────────────────────────
// Sends verification / password-reset emails through Resend's REST API when
// RESEND_API_KEY is set. With no key configured, emails are printed to the
// server console instead — the full flow stays testable in development and
// real mail switches on the moment a key + verified sender are added.
// No SDK dependency: a single fetch keeps the dependency tree flat.

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export function appBaseUrl(): string {
  return (process.env.APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

/** Link the user clicks to confirm their email address. */
export function makeVerifyLink(email: string, token: string): string {
  return `${appBaseUrl()}/?verify=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

/** Link the user clicks to choose a new password. */
export function makeResetLink(email: string, token: string): string {
  return `${appBaseUrl()}/?reset=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

function shell(title: string, paragraph: string, linkHref: string, linkLabel: string): {
  html: string;
  text: string;
} {
  const text = [
    `GABI — Generate. Align. Build. Inspire.`,
    '',
    title,
    '',
    paragraph,
    '',
    `${linkLabel}: ${linkHref}`,
    '',
    'If you did not request this, you can safely ignore this email.',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#F9F7F2;font-family:'Plus Jakarta Sans',sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F7F2;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border:1px solid #E5E0D6;border-top:4px solid #1A1A1A;">
        <tr><td style="padding:28px 32px 0;">
          <div style="font-size:20px;font-style:italic;font-weight:700;color:#1A1A1A;letter-spacing:0.5px;">GABI</div>
          <div style="font-size:9px;color:#8A8578;letter-spacing:3px;text-transform:uppercase;margin:4px 0 20px;">Generate · Align · Build · Inspire</div>
          <h1 style="margin:0 0 12px;font-size:18px;color:#1A1A1A;">${title}</h1>
          <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#44413B;">${paragraph}</p>
          <a href="${linkHref}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:13px 26px;text-decoration:none;">${linkLabel}</a>
          <p style="margin:26px 0 0;font-size:11px;line-height:1.6;color:#8A8578;">If the button does not work, open this link: <a href="${linkHref}" style="color:#1A1A1A;">${linkHref}</a></p>
          <p style="margin:18px 0 0;font-size:11px;line-height:1.6;color:#B3AFA4;">If you did not request this email, you can safely ignore it.</p>
        </td></tr>
        <tr><td style="padding:24px 32px 22px;border-top:1px solid #F0EDE5;margin-top:22px;">
          <div style="font-size:10px;color:#8A8578;">Turning brand ideas into complete, consistent identities.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { html, text };
}

export function buildVerifyEmail(to: string, link: string): MailMessage {
  const { html, text } = shell(
    'Confirm your email address',
    'Welcome to GABI. One last step — confirm your email address so your brand library is safe, recoverable, and synced across every device you sign in from.',
    link,
    'Verify Email'
  );
  return { to, subject: 'Confirm your email address — GABI', html, text };
}

export function buildResetEmail(to: string, link: string): MailMessage {
  const { html, text } = shell(
    'Reset your password',
    'We received a request to reset the password for your GABI account. Choose a new password with the link below — it expires in one hour.',
    link,
    'Reset Password'
  );
  return { to, subject: 'Reset your password — GABI', html, text };
}

async function sendViaResend(message: MailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const from = process.env.RESEND_FROM || 'GABI <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body.slice(0, 300)}`);
  }
}

/**
 * Sends an email via Resend when configured; otherwise prints it to the
 * server console (dev fallback) so the link stays clickable/testable.
 */
export async function sendMail(
  message: MailMessage
): Promise<{ transport: 'resend' | 'console'; to: string; subject: string }> {
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(message);
      console.log(`[Mail] Sent via Resend → ${message.to} (${message.subject})`);
      return { transport: 'resend', to: message.to, subject: message.subject };
    } catch (err: any) {
      // Fall through to the console copy so the link is never lost.
      console.warn('[Mail] Resend delivery failed, printing to console instead:', err?.message || err);
    }
  }
  console.log(
    `\n[Mail] ─────────────────────────────────────────────────────────────\n` +
      `[Mail] TO:      ${message.to}\n` +
      `[Mail] SUBJECT: ${message.subject}\n` +
      `[Mail] (Dev fallback — set RESEND_API_KEY + RESEND_FROM to deliver real email.)\n` +
      `[Mail]\n${message.text}\n` +
      `[Mail] ─────────────────────────────────────────────────────────────\n`
  );
  return { transport: 'console', to: message.to, subject: message.subject };
}
