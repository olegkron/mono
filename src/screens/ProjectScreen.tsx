import { type FC, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router";
import { projects } from "../constants/projects";
import { Tags } from "../components/Tag";
import styles from "./ProjectScreen.module.css";
import { routes } from "../constants/routes";
import { useSEO } from "../utils/useSEO";
import { siteConfig } from "../constants/config";
import { ArrowLeft, ArrowRight } from "tabler-icons-react";
import { renderRichText } from "../utils/renderRichText";

function ProjectHeader({ prevSlug, nextSlug }: { prevSlug?: string; nextSlug?: string }) {
  return (
    <header className={styles.header}>
      <Link to={`${routes.root}#projects`} className={styles.backButton} aria-label="Go back to homepage">
        <span className={styles.rowContainer}>
          <ArrowLeft size={18}/>
          <p>Go back</p>
        </span>
      </Link>
      <span className={styles.rowContainer}>
        {prevSlug && (
          <Link to={`${routes.projects}${prevSlug}`} className={styles.backButton} aria-label="Previous project">
            <span className={styles.rowContainer}>
              <ArrowLeft size={18}/>
              <p>Previous</p>
            </span>
          </Link>
        )}
        {nextSlug && (
          <Link to={`${routes.projects}${nextSlug}`} className={styles.backButton} aria-label="Next project">
            <span className={styles.rowContainer}>
              <p>Next</p>
              <ArrowRight size={18}/>
            </span>
          </Link>
        )}
      </span>
    </header>
  );
}

const RenderImages: FC<{ images: { src: string; alt: string }[] }> = ({ images }) => {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [errored, setErrored] = useState<boolean[]>(() => images.map(() => false));
  const filtered = images.filter((image) => image.alt || image.src);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setZoomedIndex(null); setClosing(false); }, 150);
  }, []);

  const navigate = useCallback((dir: 1 | -1) => {
    if (zoomedIndex === null) return;
    setZoomedIndex((zoomedIndex + dir + filtered.length) % filtered.length);
  }, [filtered.length, zoomedIndex]);

  useEffect(() => {
    if (zoomedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate(1);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, navigate, zoomedIndex]);

  const zoomed = zoomedIndex !== null ? filtered[zoomedIndex] : null;

  return (
    <div>
      {filtered.map((image, i) => (
        <button
          aria-label={`Open ${image.alt}`}
          className={styles.imageButton}
          key={image.src || image.alt}
          onClick={() => setZoomedIndex(i)}
          type="button"
        >
          {image.src ? (
            <img
              className={styles.image}
              src={image.src}
              alt={image.alt}
              loading="lazy"
              onError={() => setErrored((prev) => { const next = [...prev]; next[i] = true; return next; })}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-label={image.alt} />
          )}
          {errored[i] && <span className={styles.imageError}>{image.alt || "Image failed to load"}</span>}
        </button>
      ))}
      {zoomed && (
        <>
          <div className={styles.overlay} onClick={close} />
          <div
            aria-label={zoomed.alt}
            aria-modal="true"
            className={`${styles.zoomDialog}${closing ? ` ${styles.zoomedOut}` : ""}`}
            role="dialog"
          >
            <button className={styles.closeButton} onClick={close} type="button">
              Close
            </button>
            {filtered.length > 1 && (
              <div className={styles.zoomControls}>
                <button onClick={() => navigate(-1)} type="button">Previous</button>
                <button onClick={() => navigate(1)} type="button">Next</button>
              </div>
            )}
            <img
              className={styles.zoomed}
              src={zoomed.src}
              alt={zoomed.alt}
              onClick={close}
            />
          </div>
        </>
      )}
    </div>
  );
};

const RenderVideos: FC<{ videos: { src: string; alt: string }[] }> = ({ videos }) => (
  <div>
    {videos.filter((video) => video.src).map((video) => (
      <video
        className={styles.image}
        key={video.src}
        src={video.src}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      />
    ))}
  </div>
);

const RenderTitle: FC<{ title: string; link: string }> = ({ title, link }) => (
  <h1>
    {link ? (
      <a href={link} target="_blank" rel="noreferrer">{title}</a>
    ) : title}
  </h1>
);

export const ProjectScreen: FC = () => {
  const { id } = useParams();
  const project = projects.find((p) => p.link === id);

  const projectData = project?.data;
  useSEO(
    projectData ? `${projectData.title} — ${siteConfig.name}` : `Project — ${siteConfig.name}`,
    projectData ? projectData.seoDescription : "",
  );

  useLayoutEffect(() => {
    document.getElementById("root")!.scrollTop = 0;
  }, []);

  if (!project) return <Navigate to={routes.root} replace />;

  const { title, heading, link, description, images, videos, disciplines, technologies } = project.data;
  const currentIndex = projects.findIndex((p) => p.link === id);
  const prevSlug = currentIndex > 0 ? projects[currentIndex - 1].link : undefined;
  const nextSlug = currentIndex < projects.length - 1 ? projects[currentIndex + 1].link : undefined;

  return (
    <div className={styles.container}>
      <ProjectHeader prevSlug={prevSlug} nextSlug={nextSlug} />
      <main>
        <RenderTitle title={title} link={link} />
        <p className={styles.textBlock}>{heading}</p>
        <p className={styles.textBlock} style={{ color: "var(--color-grey-light)" }}>
          {renderRichText(description)}
        </p>
        <p className={`eyebrow ${styles.eyebrowHeading}`}>Disciplines</p>
        <Tags tags={disciplines} />
        <p className={`eyebrow ${styles.eyebrowHeading}`}>Technologies</p>
        <Tags tags={technologies} />
        <RenderImages images={images} />
        {videos && <RenderVideos videos={videos} />}
      </main>
    </div>
  );
};

export default ProjectScreen;
