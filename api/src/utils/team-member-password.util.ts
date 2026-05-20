/** Team member passwords set via admin (create / reset). */

/** Minimum length implied by requiring upper, lower, digit, and special (at least one of each). */
export const TEAM_MEMBER_PASSWORD_MIN_LENGTH = 4;
export const TEAM_MEMBER_PASSWORD_MAX_LENGTH = 15;

export function teamMemberPasswordPolicyMessage(): string {
  return `Password must be ${TEAM_MEMBER_PASSWORD_MIN_LENGTH}–${TEAM_MEMBER_PASSWORD_MAX_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`;
}

export function validateTeamMemberPassword(pw: string): {
  ok: boolean;
  message?: string;
} {
  const p = (typeof pw === "string" ? pw : "").trim();
  if (p.length === 0) {
    return { ok: false, message: "Password is required." };
  }
  if (p.length > TEAM_MEMBER_PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      message: `Password must be at most ${TEAM_MEMBER_PASSWORD_MAX_LENGTH} characters.`,
    };
  }
  if (p.length < TEAM_MEMBER_PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${TEAM_MEMBER_PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  if (!/[a-z]/.test(p)) {
    return { ok: false, message: "Password must include a lowercase letter." };
  }
  if (!/[A-Z]/.test(p)) {
    return { ok: false, message: "Password must include an uppercase letter." };
  }
  if (!/[0-9]/.test(p)) {
    return { ok: false, message: "Password must include a number." };
  }
  if (!/[^A-Za-z0-9]/.test(p)) {
    return {
      ok: false,
      message: "Password must include a special character.",
    };
  }
  return { ok: true };
}
