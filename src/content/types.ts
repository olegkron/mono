export type RichTextSegment = {
  text: string;
  href?: string;
};

export type SectionConfig = {
  label: string;
  isVisible: boolean;
};

export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  siteUrl: string;
  twitterHandle: string;
  locale: string;
  theme: {
    showToggle: boolean;
  };
  sections: Record<string, SectionConfig>;
};

export type PortfolioProject = {
  title: string;
  slug: string;
  category: "dev" | "visual";
  externalUrl: string;
  heading: string;
  seoDescription: string;
  description: RichTextSegment[];
  images: { src: string; alt: string }[];
  videos?: { src: string; alt: string }[];
  disciplines: string[];
  technologies: string[];
  featured?: {
    isVisible: boolean;
    role: string;
    heading: string;
    description: RichTextSegment[];
  };
};

export type PortfolioContent = {
  site: SiteConfig;
  about: RichTextSegment[];
  role: string;
  stackSections: { heading: string; items: string[] }[];
  recognition: {
    heading: string;
    items: { title: string; link?: string; info?: string }[];
  }[];
  contacts: { title: string; link: string }[];
  heroCards: {
    image: { src: string; alt: string };
    widgets: (
      | { type: "metric"; eyebrow?: string; heading: string; subheading: string }
      | { type: "cta"; image?: { src: string; alt: string }; text?: string; label: string; href: string }
      | { type: "location"; label: string }
    )[];
  };
  projects: PortfolioProject[];
};
