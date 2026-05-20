/**
 * Email sent when an admin updates a team member's profile.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type TeamMemberUpdateChange = {
  label: string;
  /** Plain-language description of what changed */
  detail: string;
};

export type TeamMemberUpdateEmailParams = {
  recipientName: string;
  changes: TeamMemberUpdateChange[];
  portalUrl: string;
  /** When set, show the new password (same idea as welcome email). */
  newPlainPassword?: string;
};

export function buildTeamMemberUpdateEmail(
  p: TeamMemberUpdateEmailParams,
): { html: string; text: string } {
  const portal = escapeHtml(p.portalUrl);
  const portalHref = p.portalUrl.startsWith("http")
    ? p.portalUrl
    : `https://${p.portalUrl}`;

  const pwdBlockHtml =
    p.newPlainPassword && p.newPlainPassword.length > 0
      ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0 0;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid #f3f4f6;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">New password</p>
                    <p style="margin:0;font-size:15px;color:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background-color:#f9fafb;padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;">${escapeHtml(p.newPlainPassword)}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Use this password with your username (email) to sign in.</p>
                  </td>
                </tr>
              </table>`
      : "";

  const changesHtml =
    p.changes.length > 0
      ? p.changes
          .map(
            (c) =>
              `<li style="margin:10px 0;padding-left:4px;"><strong style="color:#111827;">${escapeHtml(c.label)}:</strong> <span style="color:#374151;">${escapeHtml(c.detail)}</span></li>`,
          )
          .join("")
      : `<li style="margin:10px 0;color:#6b7280;">Your profile was reviewed; no field changes were detected.</li>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#ecfdf5 0%,#f0fdf4 50%,#ffffff 100%);border-bottom:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:0.06em;color:#047857;text-transform:uppercase;">Harit portal</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">Your account was updated</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#4b5563;line-height:1.5;">Hello ${escapeHtml(p.recipientName)}, an administrator made changes to your Harit account. Summary:</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.6;">
                ${changesHtml}
              </ul>
              ${pwdBlockHtml}
              <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
                Sign in:
                <a href="${escapeHtml(portalHref)}" style="color:#059669;font-weight:600;text-decoration:none;">${portal}</a>
              </p>
              <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">If you did not expect this email, contact your Harit administrator.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">This message was sent because your Harit profile was updated.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const textLines = [
    "Harit portal",
    "",
    `Hello ${p.recipientName},`,
    "",
    "An administrator updated your account. Summary:",
    "",
    ...p.changes.map((c) => `- ${c.label}: ${c.detail}`),
    ...(p.newPlainPassword
      ? ["", `New password: ${p.newPlainPassword}`, ""]
      : []),
    "",
    `Portal: ${p.portalUrl}`,
    "",
    "If you did not expect this, contact your administrator.",
  ];

  const text = textLines.join("\n");

  return { html, text };
}
