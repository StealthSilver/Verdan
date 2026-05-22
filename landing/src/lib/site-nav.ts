export type SiteNavItem = {
  name: string;
  sectionId: string;
};

/** Primary in-page anchors — shared by navbar and footer. */
export const siteNavItems: SiteNavItem[] = [
  { name: "Need", sectionId: "the-need" },
  { name: "Product", sectionId: "product" },
  { name: "How it works", sectionId: "how-it-works" },
  { name: "Features", sectionId: "features" },
  { name: "Proof", sectionId: "proof" },
  { name: "Contact", sectionId: "contact" },
];

export function sectionHref(sectionId: string) {
  return `/#${sectionId}`;
}
