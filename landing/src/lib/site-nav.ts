export type SiteNavItem = {
  name: string;
  sectionId: string;
};

/** Primary in-page anchors — navbar. */
export const siteNavItems: SiteNavItem[] = [
  { name: "Need", sectionId: "the-need" },
  { name: "Product", sectionId: "product" },
  { name: "Features", sectionId: "features" },
  { name: "Proof", sectionId: "proof" },
  { name: "Contact", sectionId: "contact" },
];

/** Footer omits in-product subsections (e.g. How it works). */
export const footerNavItems: SiteNavItem[] = siteNavItems.filter(
  (item) => item.sectionId !== "how-it-works",
);

export function sectionHref(sectionId: string) {
  return `/#${sectionId}`;
}
