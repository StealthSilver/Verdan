/**
 * Landing page spacing — each section gets top + bottom padding.
 * Gap between sections = previous bottom + next top (no double-stack on one element).
 *
 * Between sections (mobile / md / lg), approximate total:
 * - ~128px / ~112px / ~144px
 */

export const landingScrollMt = "scroll-mt-[4.25rem]";

/** Shared horizontal gutters */
export const landingSectionPx = "px-6 md:px-12 lg:px-20";

/** Space above each page section (generous on mobile) */
export const landingSectionTop = "pt-14 md:pt-8 lg:pt-10";

/** Space below each page section (and below hero) */
export const landingSectionGap = "pb-18 md:pb-22 lg:pb-32";

export const landingSectionPad = `${landingScrollMt} ${landingSectionTop} ${landingSectionGap}`;

export const landingHeroBottomPad = landingSectionGap;

/** Extra space above Need headline (first section after hero) */
export const landingNeedTopPad = "pt-20 md:pt-16 lg:pt-20";

/** Need section: scroll margin + extra top + standard bottom */
export const landingNeedSectionPad = `${landingScrollMt} ${landingNeedTopPad} ${landingSectionGap}`;

/** Below fixed navbar — extra air above headline on mobile */
export const landingHeroTopPad = "pt-44 sm:pt-[16.25rem]";

/** Below fixed navbar — inner pages (legal, etc.) */
export const landingPageTopPad = "pt-[4.25rem]";

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
export const landingHeroSubtextGap = "mt-10 sm:mt-6";

/** Hero: subtext → dashboard */
export const landingHeroDashboardGap = "mt-16 sm:mt-12 md:mt-14 lg:mt-16";

/** CTA: headline → map */
export const landingCtaHeadlineGap = "mb-10 md:mb-12";
