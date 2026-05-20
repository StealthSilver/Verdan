const AVATARS = [
  // Avatar 0: Emerald sprout
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#ECFDF5"/>
    <!-- pot -->
    <rect x="22" y="40" width="20" height="10" fill="#9A3412"/>
    <rect x="20" y="38" width="24" height="4" fill="#C2410C"/>
    <!-- stem -->
    <rect x="31" y="28" width="2" height="14" fill="#166534"/>
    <!-- leaves -->
    <rect x="26" y="26" width="8" height="6" fill="#22C55E"/>
    <rect x="30" y="23" width="10" height="6" fill="#16A34A"/>
    <!-- pixels -->
    <rect x="27" y="27" width="2" height="2" fill="#10B981"/>
    <rect x="35" y="24" width="2" height="2" fill="#34D399"/>
  </svg>`,
  // Avatar 1: Sky cactus
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#EFF6FF"/>
    <!-- pot -->
    <rect x="22" y="42" width="20" height="8" fill="#334155"/>
    <rect x="20" y="40" width="24" height="3" fill="#475569"/>
    <!-- cactus -->
    <rect x="30" y="22" width="6" height="22" fill="#0EA5E9"/>
    <rect x="24" y="28" width="6" height="10" fill="#0284C7"/>
    <rect x="36" y="30" width="6" height="8" fill="#38BDF8"/>
    <!-- spikes -->
    <rect x="31" y="24" width="1" height="1" fill="#E2E8F0"/>
    <rect x="33" y="27" width="1" height="1" fill="#E2E8F0"/>
    <rect x="35" y="31" width="1" height="1" fill="#E2E8F0"/>
  </svg>`,
  // Avatar 2: Amber flower
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#FFFBEB"/>
    <!-- stem -->
    <rect x="31" y="28" width="2" height="20" fill="#166534"/>
    <!-- leaf -->
    <rect x="26" y="34" width="8" height="4" fill="#22C55E"/>
    <!-- flower -->
    <rect x="28" y="18" width="8" height="8" fill="#F59E0B"/>
    <rect x="26" y="20" width="12" height="4" fill="#FBBF24"/>
    <rect x="30" y="16" width="4" height="12" fill="#F97316"/>
    <rect x="30" y="20" width="4" height="4" fill="#7C2D12"/>
    <!-- base -->
    <rect x="22" y="48" width="20" height="4" fill="#A16207"/>
  </svg>`,
  // Avatar 3: Purple bonsai
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#F5F3FF"/>
    <!-- canopy -->
    <rect x="20" y="18" width="24" height="12" fill="#7C3AED"/>
    <rect x="18" y="22" width="28" height="10" fill="#8B5CF6"/>
    <rect x="24" y="16" width="16" height="8" fill="#6D28D9"/>
    <!-- trunk -->
    <rect x="30" y="30" width="4" height="16" fill="#92400E"/>
    <!-- pot -->
    <rect x="22" y="46" width="20" height="6" fill="#1F2937"/>
    <rect x="20" y="44" width="24" height="3" fill="#374151"/>
    <!-- pixels -->
    <rect x="24" y="20" width="2" height="2" fill="#DDD6FE"/>
    <rect x="38" y="24" width="2" height="2" fill="#EDE9FE"/>
  </svg>`,
  // Avatar 4: Hot pink tulip
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#FFF1F2"/>
    <!-- stem -->
    <rect x="31" y="28" width="2" height="22" fill="#166534"/>
    <!-- leaves -->
    <rect x="24" y="36" width="10" height="4" fill="#22C55E"/>
    <rect x="30" y="34" width="10" height="4" fill="#16A34A"/>
    <!-- flower -->
    <rect x="28" y="16" width="8" height="10" fill="#EC4899"/>
    <rect x="26" y="18" width="12" height="8" fill="#F472B6"/>
    <rect x="30" y="14" width="4" height="14" fill="#DB2777"/>
    <!-- pot -->
    <rect x="22" y="50" width="20" height="4" fill="#9A3412"/>
  </svg>`,
  // Avatar 5: Lime monster fern
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#F7FEE7"/>
    <!-- pot -->
    <rect x="22" y="46" width="20" height="6" fill="#3F3F46"/>
    <rect x="20" y="44" width="24" height="3" fill="#52525B"/>
    <!-- fern fronds -->
    <rect x="30" y="20" width="4" height="26" fill="#3F6212"/>
    <rect x="24" y="22" width="6" height="4" fill="#84CC16"/>
    <rect x="34" y="24" width="6" height="4" fill="#A3E635"/>
    <rect x="22" y="28" width="8" height="4" fill="#65A30D"/>
    <rect x="34" y="30" width="8" height="4" fill="#84CC16"/>
    <rect x="24" y="34" width="6" height="4" fill="#A3E635"/>
    <rect x="34" y="36" width="6" height="4" fill="#65A30D"/>
    <!-- pixels -->
    <rect x="30" y="24" width="2" height="2" fill="#D9F99D"/>
    <rect x="32" y="32" width="2" height="2" fill="#D9F99D"/>
  </svg>`,
  // Avatar 6: Teal seaweed
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#ECFEFF"/>
    <!-- base -->
    <rect x="18" y="48" width="28" height="4" fill="#0F172A"/>
    <!-- stalks -->
    <rect x="22" y="26" width="4" height="22" fill="#0F766E"/>
    <rect x="30" y="20" width="4" height="28" fill="#14B8A6"/>
    <rect x="38" y="24" width="4" height="24" fill="#0D9488"/>
    <!-- bubbles -->
    <rect x="26" y="22" width="2" height="2" fill="#A5F3FC"/>
    <rect x="40" y="20" width="2" height="2" fill="#A5F3FC"/>
    <rect x="34" y="18" width="2" height="2" fill="#67E8F9"/>
  </svg>`,
  // Avatar 7: Red chili plant
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#FEF2F2"/>
    <!-- pot -->
    <rect x="22" y="46" width="20" height="6" fill="#7C2D12"/>
    <rect x="20" y="44" width="24" height="3" fill="#9A3412"/>
    <!-- stem -->
    <rect x="31" y="24" width="2" height="22" fill="#166534"/>
    <!-- leaves -->
    <rect x="24" y="26" width="8" height="4" fill="#22C55E"/>
    <rect x="32" y="28" width="8" height="4" fill="#16A34A"/>
    <!-- chili -->
    <rect x="36" y="34" width="6" height="10" fill="#EF4444"/>
    <rect x="34" y="36" width="2" height="6" fill="#DC2626"/>
    <rect x="38" y="32" width="2" height="2" fill="#166534"/>
  </svg>`,
  // Avatar 8: Grey boring user
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#F1F5F9"/>
    <!-- simple head -->
    <rect x="26" y="20" width="12" height="12" fill="#94A3B8"/>
    <rect x="28" y="24" width="2" height="2" fill="#0F172A"/>
    <rect x="34" y="24" width="2" height="2" fill="#0F172A"/>
    <!-- body -->
    <rect x="22" y="34" width="20" height="14" fill="#CBD5E1"/>
    <rect x="26" y="36" width="12" height="2" fill="#94A3B8"/>
  </svg>`,
  // Avatar 9: Rainbow moss
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#F8FAFC"/>
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#FAF5FF"/>
    <!-- pot -->
    <rect x="22" y="46" width="20" height="6" fill="#0F172A"/>
    <rect x="20" y="44" width="24" height="3" fill="#334155"/>
    <!-- moss blob -->
    <rect x="22" y="26" width="20" height="18" fill="#22C55E"/>
    <rect x="20" y="30" width="24" height="12" fill="#16A34A"/>
    <!-- rainbow pixels -->
    <rect x="24" y="28" width="2" height="2" fill="#EF4444"/>
    <rect x="28" y="28" width="2" height="2" fill="#F59E0B"/>
    <rect x="32" y="28" width="2" height="2" fill="#EAB308"/>
    <rect x="36" y="28" width="2" height="2" fill="#3B82F6"/>
    <rect x="26" y="34" width="2" height="2" fill="#A855F7"/>
    <rect x="34" y="36" width="2" height="2" fill="#F472B6"/>
  </svg>`,
];

export type AvatarId = number;

function clampAvatarId(id: number): number {
  return Math.max(0, Math.min(AVATARS.length - 1, Math.floor(id)));
}

export function avatarDataUrl(id: number): string {
  const svg = AVATARS[clampAvatarId(id)];
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AVATAR_KEY_PREFIX = "avatar:v1:";

export function getOrCreateAvatarId(email: string): AvatarId {
  const key = `${AVATAR_KEY_PREFIX}${email.toLowerCase()}`;
  const existing = localStorage.getItem(key);
  if (existing != null) {
    const n = Number(existing);
    if (Number.isFinite(n)) return clampAvatarId(n);
  }
  const random = clampAvatarId(Math.floor(Math.random() * AVATARS.length));
  localStorage.setItem(key, String(random));
  return random;
}

export function setAvatarId(email: string, id: number) {
  const key = `${AVATAR_KEY_PREFIX}${email.toLowerCase()}`;
  localStorage.setItem(key, String(clampAvatarId(id)));
}

