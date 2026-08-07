import sectionsJson from "./sections.json";
import categoriesJson from "./categories.json";

export type Section = {
  id: string;
  title: string;
  handle: string;
  groups: string[];
  rawGroups: string[];
  image: string;
  price: number;
  isPro: boolean;
  link: string;
  liquid?: string;
};

export type Category = {
  handle: string;
  title: string;
  sortOrder: number;
  count: number;
};

export const sections: Section[] = sectionsJson as Section[];
export const categories: Category[] = categoriesJson as Category[];

export function getSection(handle?: string): Section | undefined {
  return sections.find((s) => s.handle === handle);
}

export function getSectionsWithoutLiquid(): Omit<Section, "liquid">[] {
  return sections.map(({ liquid: _liquid, ...s }) => s);
}
