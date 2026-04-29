import { type FC, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { about, contacts, recognition, stackSections } from "../constants/bio";
import { HomeHeader } from "../components/HomeHeader";
import { featuredProjects, sections } from "../constants/home";
import { routes } from "../constants/routes";
import { useSEO } from "../utils/useSEO";
import { siteConfig } from "../constants/config";
import classNames from "./HomeScreen.module.css";
import { renderRichText } from "../utils/renderRichText";
import { GridWidgets } from "../components/GridWidgets";
import { homeWidgets } from "../constants/widgets";

interface HomeScreenProps {
  themeToggle?: { theme: "dark" | "light"; toggle: () => void };
}

const PROJECTS_PER_PAGE = 3;

type FeaturedProject = (typeof featuredProjects)[number];

const chunkProjects = (projects: FeaturedProject[]) =>
  projects.reduce<FeaturedProject[][]>((pages, project, index) => {
    if (index % PROJECTS_PER_PAGE === 0) pages.push([]);
    pages[pages.length - 1].push(project);
    return pages;
  }, []);

const SectionLinkList = ({
  items,
}: {
  items: { title: string; link?: string; info?: string }[];
}) => (
  <div className={classNames.linkList}>
    {items.map((item) =>
      item.link ? (
        <a href={item.link} key={item.title} rel="noreferrer" target="_blank">
          {item.title}
          {item.info && <span className={"eyebrow"}>{item.info}</span>}
        </a>
      ) : (
        <p key={item.title}>
          {item.title}
          {item.info && <span className={"eyebrow"}>{item.info}</span>}
        </p>
      ),
    )}
  </div>
);

const ProjectCard = ({ project }: { project: FeaturedProject }) => (
  <article className={classNames.projectCard}>
    <div className={classNames.projectPreviewHeader}>
      <Link to={`${routes.projects}${project.link}`} aria-label={`View ${project.title} project`}>
        {project.title}
      </Link>
      <p className={classNames.meta}>{project.role}</p>
    </div>
    <p>{project.heading}</p>
    <p className={classNames.projectDescription}>{renderRichText(project.description)}</p>
  </article>
);

const ProjectsSection = () => {
  const pages = chunkProjects(featuredProjects);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => setActivePage(Math.round(scroller.scrollLeft / scroller.clientWidth));
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={classNames.sectionContent}>
      <div className={classNames.projectScroller} ref={scrollerRef}>
        {pages.map((page) => (
          <div className={classNames.projectPage} key={page.map((p) => p.title).join("-")}>
            {page.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </div>
        ))}
      </div>
      {pages.length > 1 && (
        <div className={classNames.projectDots}>
          {pages.map((_, i) => (
            <div key={i} className={classNames.projectDot} data-active={i === activePage} />
          ))}
        </div>
      )}
    </div>
  );
};

const renderers = {
  about: (
    <div className={classNames.sectionContent}>
      <div className={classNames.aboutText}>
        <h2 className={classNames.hiHeading}>Hi!</h2>
        <p className={classNames.lead}>{renderRichText(about)}</p>
        <div className={classNames.inlineList}>
          {contacts.map((item) =>
            item.link ? (
              <a href={item.link} key={item.title} rel="noreferrer" target="_blank">
                {item.title}
              </a>
            ) : (
              <p key={item.title}>{item.title}</p>
            )
          )}
        </div>
      </div>

     <GridWidgets widgets={homeWidgets} />
    </div>
  ),
  projects: <ProjectsSection />,
  stack: (
    <div className={classNames.sectionContent}>
      {stackSections.map((group) => (
        <div key={group.heading}>
          <p className="eyebrow">{group.heading}</p>
          <div className={classNames.inlineList}>
            {group.items.map((item) => (
              <p key={item.title}>{item.title}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  recognition: (
    <div className={classNames.sectionContent}>
      {recognition.map((group) => (
        <div key={group.heading}>
          <p className="eyebrow">{group.heading}</p>
          <SectionLinkList items={group.items} />
        </div>
      ))}
    </div>
  ),
} as const;

export const HomeScreen: FC<HomeScreenProps> = ({ themeToggle }) => {
  useSEO(siteConfig.title, siteConfig.description);

  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef<(InstanceType<typeof globalThis.HTMLElement> | null)[]>([]);
  const activeSectionRef = useRef(0);

  const updateActiveSection = (index: number) => {
    activeSectionRef.current = index;
    setActiveSection(index);
  };

  const scrollToSection = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, sections.length - 1));
    const section = sectionRefs.current[nextIndex];
    const root = document.getElementById("root");
    if (section && root) {
      root.scrollTo({ top: section.offsetTop, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    root.classList.add("homeSnap");

    const hash = window.location.hash.slice(1);
    const savedIndex = Math.max(0, sections.indexOf(decodeURIComponent(hash) as (typeof sections)[number]));
    if (savedIndex > 0) {
      requestAnimationFrame(() => {
        const section = sectionRefs.current[savedIndex];
        if (section) root.scrollTop = section.offsetTop;
        root.classList.add("homeSnapSmooth");
      });
    } else {
      root.classList.add("homeSnapSmooth");
    }

    const handleScroll = () => {
      const nextIndex = sectionRefs.current.reduce((closest, section, index) => {
        if (!section) return closest;
        const sectionDistance = Math.abs(section.getBoundingClientRect().top);
        const closestSection = sectionRefs.current[closest];
        const closestDistance = closestSection
          ? Math.abs(closestSection.getBoundingClientRect().top)
          : Number.POSITIVE_INFINITY;
        return sectionDistance < closestDistance ? index : closest;
      }, 0);

      if (nextIndex !== activeSectionRef.current) {
        updateActiveSection(nextIndex);
        history.replaceState(null, "", `#${encodeURIComponent(sections[nextIndex])}`);
      }
    };

    root.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      root.classList.remove("homeSnap", "homeSnapSmooth");
      root.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <HomeHeader activeSection={activeSection} scrollToSection={scrollToSection} themeToggle={themeToggle} />

      <div className={classNames.container} style={{ animation: "pageFadeIn 220ms ease both" }}>
        <main className={classNames.sections}>
          {sections.map((key, index) => (
            <section
              key={key}
              id={key}
              className={classNames.section}
              ref={(node) => { sectionRefs.current[index] = node; }}
            >
              {renderers[key as keyof typeof renderers]}
              {index === sections.length - 1 && (
                <button
                  type="button"
                  className={classNames.backToTop}
                  onClick={() => scrollToSection(0)}
                >
                  Back to top
                </button>
              )}
            </section>
          ))}
        </main>
      </div>
    </>
  );
};
