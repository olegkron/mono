import { portfolio } from "../content";
import type { RichTextSegment } from "../content/types";

type ProjectData = {
  title: string;
  link: string;
  heading: string;
  seoDescription: string;
  description: RichTextSegment[];
  images: { src: string; alt: string }[];
  videos?: { src: string; alt: string }[];
  disciplines: string[];
  technologies: string[];
};

type Project = {
  title: string;
  link: string;
  data: ProjectData;
};

export const projects: Project[] = portfolio.projects.map((project) => ({
  title: project.slug,
  link: project.slug,
  data: {
    title: project.title,
    link: project.externalUrl,
    heading: project.heading,
    seoDescription: project.seoDescription,
    description: project.description,
    images: project.images,
    videos: project.videos,
    disciplines: project.disciplines,
    technologies: project.technologies,
  },
}));
