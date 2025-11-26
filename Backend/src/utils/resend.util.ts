import { Resend } from "resend";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendResendEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(apiKey);

  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  const toArray = Array.isArray(payload.to) ? payload.to : [payload.to];

  const result = await resend.emails.send({
    from,
    to: toArray,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email via Resend");
  }

  return result;
}
