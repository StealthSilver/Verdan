/**
 * HTML + plain-text welcome email for newly created team members (credentials).
 * Uses inline styles for broad mail-client support.
 */

export type TeamWelcomeEmailParams = {
  recipientName: string;
  email: string;
  plainPassword: string;
  siteNames: string[];
  roleLabel: string;
  designation: string;
  portalUrl: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function roleDisplayLabel(role: string): string {
  const r = role?.toLowerCase?.() ?? role;
  if (r === "admin") return "Administrator";
  if (r === "user") return "User";
  return role || "—";
}

export function resolvePortalUrlForEmail(): string {
  const fromEnv =
    process.env.HARIT_PORTAL_URL?.trim() ||
    process.env.FRONTEND_ORIGIN?.trim() ||
    process.env.PORTAL_PUBLIC_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://harit-infield.serenticaglobal.com/";
}

export function buildTeamWelcomeEmail(
  p: TeamWelcomeEmailParams,
): { html: string; text: string } {
  const portal = escapeHtml(p.portalUrl);
  const portalHref = p.portalUrl.startsWith("http")
    ? p.portalUrl
    : `https://${p.portalUrl}`;
  const sitesList =
    p.siteNames.length > 0
      ? p.siteNames.map((n) => `<li style="margin:6px 0;">${escapeHtml(n)}</li>`).join("")
      : `<li style="margin:6px 0;color:#6b7280;">No sites assigned</li>`;

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
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">Welcome, ${escapeHtml(p.recipientName)}</h1>
              <p style="margin:12px 0 0;font-size:14px;color:#4b5563;line-height:1.5;">Your account has been created. Use the credentials below to sign in.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Username</p>
                    <p style="margin:0;font-size:15px;color:#111827;word-break:break-all;">${escapeHtml(p.email)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Password</p>
                    <p style="margin:0;font-size:15px;color:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;background-color:#f9fafb;padding:10px 12px;border-radius:8px;border:1px solid #e5e7eb;">${escapeHtml(p.plainPassword)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Assigned sites</p>
                    <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.5;">
                      ${sitesList}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Role</p>
                    <p style="margin:0;font-size:15px;color:#111827;">${escapeHtml(p.roleLabel)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">Designation</p>
                    <p style="margin:0;font-size:15px;color:#111827;">${escapeHtml(p.designation)}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:14px;color:#374151;line-height:1.6;">
                Open the portal:
                <a href="${escapeHtml(portalHref)}" style="color:#059669;font-weight:600;text-decoration:none;">${portal}</a>
              </p>
              <p style="margin:20px 0 0;font-size:15px;color:#111827;line-height:1.5;">Thank you.</p>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">Please keep this email secure and change your password after first login if prompted.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">This message was sent because an administrator added you to Harit.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  const sitesText =
    p.siteNames.length > 0 ? p.siteNames.map((n) => `  - ${n}`).join("\n") : "  (none)";

  const text = [
    "Harit portal",
    "",
    `Welcome, ${p.recipientName}`,
    "",
    "Your account has been created. Use the credentials below to sign in.",
    "",
    `Username (email): ${p.email}`,
    `Password: ${p.plainPassword}`,
    "",
    "Assigned sites:",
    sitesText,
    "",
    `Role: ${p.roleLabel}`,
    `Designation: ${p.designation}`,
    "",
    `Portal: ${p.portalUrl}`,
    "",
    "Thank you.",
  ].join("\n");

  return { html, text };
}
