/** Escape text for safe insertion into HTML email bodies. */
export function escapeHtmlForEmail(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRAND = "HARIT";
const PRIMARY = "#2f6f4a";
const PRIMARY_SOFT = "#e8f3ec";
const PAGE_BG = "#f4f6f8";
const CARD_BORDER = "#e5e7eb";
const TEXT = "#1f2937";
const MUTED = "#6b7280";

function emailShell(inner: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${PAGE_BG};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${PAGE_BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 20px 0;text-align:left;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;letter-spacing:0.12em;color:${PRIMARY};">${BRAND}</span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid ${CARD_BORDER};border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);padding:0;">
              <div style="max-width:560px;">
              ${inner}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 4px 0 4px;text-align:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:${MUTED};line-height:1.5;">
              This message was sent by ${BRAND}. Please do not reply if you were not expecting it.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.04);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;vertical-align:top;">
        <span style="display:block;color:${MUTED};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px;">${label}</span>
        <span style="color:${TEXT};line-height:1.5;">${value}</span>
      </td>
    </tr>`;
}

function approveButtonBlock(approveUrl: string): string {
  const href = escapeHtmlForEmail(approveUrl);
  return `
    <div style="margin:24px 0 0 0;text-align:left;">
      <a href="${href}" style="display:inline-block;padding:12px 22px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;background:${PRIMARY};border-radius:10px;">Approve Request</a>
      <p style="margin:14px 0 0 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${MUTED};line-height:1.5;">Opens your team page, starts <strong style="color:${TEXT};font-weight:600;">Add team member</strong>, and fills name, email, and the password they chose. You can finish role, designation, and sites as usual.</p>
    </div>`;
}

export function buildAdminAccessRequestHtml(input: {
  name: string;
  email: string;
  company: string;
  approveUrl?: string | null;
}): string {
  const name = escapeHtmlForEmail(input.name);
  const email = escapeHtmlForEmail(input.email);
  const company = escapeHtmlForEmail(input.company || "—");
  const approve =
    input.approveUrl && input.approveUrl.length > 0
      ? approveButtonBlock(input.approveUrl)
      : `<p style="margin:20px 0 0 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:${MUTED};line-height:1.55;">To enable the <strong style="color:${TEXT};">Approve Request</strong> button, set <code style="background:${PRIMARY_SOFT};padding:2px 6px;border-radius:4px;font-size:13px;">ACCESS_REQUEST_APPROVE_SITE_ID</code> to a site ID, or keep a single site in the database.</p>`;

  const inner = `
    <div style="padding:28px 28px 24px 28px;">
      <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:600;color:${PRIMARY};text-transform:uppercase;letter-spacing:0.06em;">New access request</p>
      <h1 style="margin:0 0 16px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">Someone requested access to ${BRAND}</h1>
      <p style="margin:0 0 20px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:${MUTED};line-height:1.55;">Review the details below and follow up with the applicant from your ${BRAND} admin workflow.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:${PRIMARY_SOFT};border-radius:10px;">
        ${row("Name", name)}
        ${row("Email", `<a href="mailto:${email}" style="color:${PRIMARY};text-decoration:none;">${email}</a>`)}
        ${row("Company", company)}
      </table>
      ${approve}
    </div>`;

  return emailShell(inner);
}

export function buildRequesterAccessConfirmationHtml(input: {
  name: string;
}): string {
  const name = escapeHtmlForEmail(input.name);
  const inner = `
    <div style="padding:28px 28px 28px 28px;">
      <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;font-weight:600;color:${PRIMARY};text-transform:uppercase;letter-spacing:0.06em;">Request received</p>
      <h1 style="margin:0 0 14px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:700;color:${TEXT};line-height:1.3;">Thank you, ${name}</h1>
      <p style="margin:0 0 18px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:${MUTED};line-height:1.6;">We have received your request for admin access to ${BRAND}. Our team will review your submission and contact you at the email address you provided.</p>
      <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;color:${MUTED};line-height:1.6;">If you did not submit this request, you can safely ignore this message.</p>
    </div>`;

  return emailShell(inner);
}

export function adminAccessRequestPlainText(input: {
  name: string;
  email: string;
  company: string;
  approveUrl?: string | null;
}): string {
  const lines = [
    `${BRAND} — New admin access request`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company || "—"}`,
    "",
  ];
  if (input.approveUrl && input.approveUrl.length > 0) {
    lines.push("Approve Request (opens team page with form prefilled):");
    lines.push(input.approveUrl);
    lines.push("");
    lines.push(
      "After opening the link, complete role, designation, and site assignment, then create the user as usual.",
    );
  } else {
    lines.push(
      "Configure ACCESS_REQUEST_APPROVE_SITE_ID (or use a single-site database) to generate an Approve Request link in the HTML email.",
    );
  }
  return lines.join("\n");
}

export function requesterAccessConfirmationPlainText(input: {
  name: string;
}): string {
  return [
    `${BRAND} — We received your access request`,
    "",
    `Hi ${input.name},`,
    "",
    `Thank you for your interest in ${BRAND}. We have received your request for admin access and will be in touch after our team reviews it.`,
    "",
    "If you did not submit this request, you can ignore this email.",
  ].join("\n");
}
