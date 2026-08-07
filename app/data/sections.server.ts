import { readFileSync } from "fs";
import { resolve } from "path";
import sectionsJson from "./sections.json";
import categoriesJson from "./categories.json";
import { generateSectionLiquid } from "../lib/section-template";

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
  const section = sections.find((s) => s.handle === handle);
  if (!section) return undefined;

  const liquidPath = resolve(process.cwd(), "app/sections", `${handle}.liquid`);
  try {
    const liquid = readFileSync(liquidPath, "utf-8");
    return { ...section, liquid };
  } catch {
    return {
      ...section,
      liquid: generateSectionLiquid(section.title, section.handle),
    };
  }
}

export function getSectionsWithoutLiquid(): Omit<Section, "liquid">[] {
  return sections.map(({ liquid: _liquid, ...s }) => s);
}
