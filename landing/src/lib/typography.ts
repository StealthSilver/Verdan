/**
 * Marketing page typography — single scale, mobile-first.
 *
 * Scale (marketing copy only; UI mocks keep their own micro sizes):
 * - Display: PageHeadline (see PageHeadline.tsx)
 * - Lede: 15px → 16px from sm (under section headlines)
 * - Title: 20px → 24px from md (block headings)
 * - Callout: 24px → 30px from md (one emphasis line per act)
 * - Lead: 18px → 20px from md (closing statements)
 * - Body: 14px (default copy, lists, bullets)
 * - Eyebrow: 11px uppercase (act / block labels)
 * - Caption: 12px (footnotes, chart keys)
 * - Micro: 10px (data-viz axis labels only)
 */

export const typeEyebrow =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45";

export const typeEyebrowLight =
  "text-[11px] font-medium uppercase tracking-[0.2em] text-white/70";

export const typeCaption =
  "text-xs font-light text-[var(--color-font)]/50";

export const typeCaptionMedium =
  "text-xs font-medium uppercase tracking-wider text-[var(--color-font)]/40";

export const typeMicro =
  "text-[10px] font-medium uppercase tracking-wider text-[var(--color-font)]/40";

export const typeLede =
  "text-[15px] font-light leading-relaxed text-[var(--color-font)]/70 sm:text-base";

export const typeSectionIntro =
  "mt-6 max-w-2xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/70 sm:text-base";

/** Lede without top margin — nested under headlines or in sub-blocks. */
export const typeLedeMax =
  "max-w-2xl text-[15px] font-light leading-relaxed text-[var(--color-font)]/70 sm:text-base";

export const typeBody =
  "text-sm font-light leading-relaxed text-[var(--color-font)]/70";

export const typeBodyStrong =
  "text-sm font-light leading-relaxed text-[var(--color-font)]/75";

export const typeBodyMuted =
  "text-sm font-light leading-relaxed text-[var(--color-font)]/60";

export const typeBodyOnDark =
  "text-sm font-light leading-relaxed text-white/75";

export const typeBodyOnDarkBright =
  "text-sm font-light text-white/95";

export const typeTitle =
  "text-xl font-normal leading-snug tracking-tight text-[var(--color-font)] md:text-2xl";

export const typeTitleMedium =
  "text-xl font-medium leading-snug tracking-tight text-[var(--color-font)] md:text-2xl";

export const typeCallout =
  "text-2xl font-medium leading-tight tracking-tight text-[var(--color-font)] md:text-3xl";

export const typeLead =
  "text-lg font-medium leading-snug tracking-tight md:text-xl";

export const typeLeadCentered =
  "text-center text-lg font-medium leading-snug tracking-tight md:text-xl";

export const typeCardTitle =
  "text-sm font-normal leading-snug tracking-tight text-[var(--color-font)] sm:text-base";

export const typeListItem =
  "flex items-center gap-3 text-sm font-light text-[var(--color-font)]/70";

export const typeListItemStart =
  "flex items-start gap-2.5 text-sm font-light text-[var(--color-font)]/75";

export const typeBullet =
  "flex items-start gap-2.5 text-sm font-light text-[var(--color-font)]/85";

export const typeStatValue =
  "text-3xl font-light tracking-tight md:text-4xl";

export const typeStatSuffix =
  "text-lg font-light md:text-xl";

export const typeStatLabel =
  "text-sm font-light leading-relaxed text-[var(--color-font)]/65";

export const typeStatHero =
  "text-4xl font-light tracking-tight md:text-5xl";

export const typeMetricValue =
  "text-3xl font-light leading-none tracking-tight text-[var(--color-font)] md:text-4xl";

export const typeMetricSuffix =
  "text-lg font-light text-[var(--color-font)]/45 md:text-xl";

export const typeMetricLabel =
  "text-sm font-medium leading-snug text-[var(--color-font)]/55";

export const typeHeroSubtext =
  "text-sm font-light leading-snug text-gray-600";

export const typeNav = "text-sm font-light";

export const typeNavMobile = "text-[15px] font-light sm:text-sm";

export const typeUi = "text-sm";

export const typeUiMedium = "text-sm font-medium";
