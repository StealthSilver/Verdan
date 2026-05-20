import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS !== undefined &&
      String(process.env.SMTP_PASS).length > 0,
  );
}

const trimEnv = (v: string | undefined) => (v ?? "").trim();

function smtpAuthFailureHint(reason: unknown): void {
  const m =
    typeof reason === "object" && reason !== null && "responseCode" in reason
      ? Number((reason as { responseCode?: number }).responseCode)
      : undefined;
  const text = String(reason);
  const looksLikeAuth =
    m === 535 ||
    m === 534 ||
    m === 530 ||
    m === 501 ||
    /auth|credential|invalid user|invalid login|login rejected|password/i.test(
      text,
    );
  if (!looksLikeAuth) return;
  console.error(
    "[SMTP] Authentication or credentials may be wrong. If SMTP_PASS contains '#' (hash), wrap the full value in double quotes in .env, e.g. SMTP_PASS=\"your#secret\" — otherwise characters after '#' are ignored as comments.",
  );
}

/**
 * Inbox for public "Request access" notifications.
 * Order: SIGNUP_NOTIFY_TO → SMTP_FROM_EMAIL → SMTP_USER (must look like an email).
 */
export function resolveSignupNotifyTo(): string | undefined {
  const candidates = [
    trimEnv(process.env.SIGNUP_NOTIFY_TO),
    trimEnv(process.env.SMTP_FROM_EMAIL),
    trimEnv(process.env.SMTP_USER),
  ];
  for (const c of candidates) {
    if (c.includes("@")) return c;
  }
  return undefined;
}

/**
 * Emails listed for access-request / master-admin alerts (SIGNUP_NOTIFY_TO).
 * Comma- or semicolon-separated; normalized to lowercase for DB lookup.
 */
export function getSignupNotifyEmails(): string[] {
  const raw = trimEnv(process.env.SIGNUP_NOTIFY_TO);
  if (!raw) return [];
  const parts = raw.split(/[,;]/).map((s) => s.trim().toLowerCase());
  return parts.filter((p) => p.includes("@"));
}

/**
 * Send mail via nodemailer. Requires SMTP_HOST, SMTP_USER, SMTP_PASS.
 * Uses SMTP_PORT (default 587); use 465 for implicit TLS.
 * From address: SMTP_FROM_EMAIL if set, otherwise SMTP_USER.
 */
export type SendEmailOptions = {
  /** Display name in From header, e.g. HARIT. Falls back to SMTP_FROM_NAME env or "HARIT". */
  fromName?: string;
};

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
  options?: SendEmailOptions,
) {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP is not configured (need SMTP_HOST, SMTP_USER, SMTP_PASS)",
    );
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const fromAddr =
    process.env.SMTP_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName =
    options?.fromName?.trim() ||
    process.env.SMTP_FROM_NAME?.trim() ||
    "HARIT";

  const tlsInsecure =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0" ||
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "0";

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!.trim(),
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER!.trim(),
        pass: process.env.SMTP_PASS,
      },
      ...(tlsInsecure ? { tls: { rejectUnauthorized: false } } : {}),
    });

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    smtpAuthFailureHint(error);
    const msg =
      error instanceof Error ? error.message : "Failed to send email";
    throw new Error(`SMTP send failed: ${msg}`);
  }
}
