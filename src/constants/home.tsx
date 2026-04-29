import { portfolio } from "../content";
import type { RichTextSegment } from "../content/types";
import { siteConfig } from "../constants/config";

export const sections = (
  Object.entries(siteConfig.sections) as [string, { label: string; isVisible: boolean }][]
)
  .filter(([, { isVisible }]) => isVisible)
  .map(([, { label }]) => label);

export const featuredProjects: {
  title: string;
  heading: string;
  role: string;
  link: string;
  description: RichTextSegment[];
}[] = portfolio.projects
  .filter((project) => project.featured?.isVisible)
  .map((project) => ({
    title: project.title,
    heading: project.featured?.heading ?? project.heading,
    role: project.featured?.role ?? "",
    link: project.slug,
    description: project.featured?.description ?? project.description,
  }));
