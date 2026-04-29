import { portfolio } from "../content";

export const about = portfolio.about;
export const role = portfolio.role;
export const stackSections = portfolio.stackSections.map((group) => ({
  heading: group.heading,
  items: group.items.map((title) => ({ title })),
}));
export const recognition = portfolio.recognition;
export const contacts = portfolio.contacts;
export const heroCards = portfolio.heroCards;
