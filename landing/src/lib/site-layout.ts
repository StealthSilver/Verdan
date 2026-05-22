/**
 * Landing page spacing — mobile-first, bottom-padding between sections
 * so gaps never double-stack (top + bottom).
 *
 * Between sections (mobile / md / lg):
 * - 56px / 64px / 112px — via `landingSectionGap` only
 */

export const landingScrollMt = "scroll-mt-[4.25rem]";

/** Shared horizontal gutters */
export const landingSectionPx = "px-6 md:px-12 lg:px-20";

/** Gap below each page section (and below hero) */
export const landingSectionGap = "pb-14 md:pb-16 lg:pb-28";

export const landingSectionPad = `${landingScrollMt} ${landingSectionGap}`;

export const landingHeroBottomPad = landingSectionGap;

/** Extra space above Need headline (first section after hero) */
export const landingNeedTopPad = "pt-12 md:pt-14 lg:pt-16";

/** Below fixed navbar */
export const landingHeroTopPad = "pt-[4.25rem] sm:pt-[16.25rem]";

/** Section headline block → first major block */
export const landingAfterHeadline = "mt-16 md:mt-20";

/** Between major acts / product blocks / proof panels */
export const landingStackMajor = "mt-16 md:mt-20 lg:mt-24";

/** Below act label / eyebrow row */
export const landingStackAfterLabel = "mt-6";

/** Before stat grids and similar */
export const landingStackBeforeGrid = "mt-10 md:mt-12";

/** Vertical gap in flex stacks (product blocks, mobile column) */
export const landingStackGap = "gap-16 md:gap-20 lg:gap-24";

/** Two-column product block interior */
export const landingInlineGap = "gap-10 md:gap-12 lg:gap-16";

/** Anchored sub-section inside a parent (e.g. How it works) */
export const landingInSectionGap = "mt-16 md:mt-20 lg:mt-28";

/** Stacked panels inside proof (and similar) */
export const landingPanelStack = "mt-8 md:mt-10";

/** Section closing emphasis line */
export const landingClosing = "mt-14 md:mt-16";

/** Hero: headline → subtext row */
export const landingHeroSubtextGap = "mt-6 sm:mt-6";

/** Hero: subtext → dashboard */
export const landingHeroDashboardGap = "mt-12 md:mt-14 lg:mt-16";

/** CTA: headline → map */
export const landingCtaHeadlineGap = "mb-10 md:mb-12";
