import { type CSSProperties } from "react";
import { sections } from "../constants/home";
import { ThemeToggle } from "./ThemeToggle";
import classNames from "../screens/HomeScreen.module.css";
import { siteConfig } from "../constants/config";

interface HomeHeaderProps {
  activeSection: number;
  scrollToSection: (index: number) => void;
  themeToggle?: { theme: "dark" | "light"; toggle: () => void };
}

export const HomeHeader = ({ activeSection, scrollToSection, themeToggle }: HomeHeaderProps) => (
  <header className={classNames.pickerHeader}>
    <h1 className={classNames.name}>{siteConfig.name}</h1>
    <nav aria-label="Homepage sections" className={classNames.picker}>
      <span className={classNames.pickerDot} aria-hidden="true" />
      <div
        className={classNames.pickerTrack}
        style={{ transform: `translateY(${(1 - activeSection) * 1.5}rem)` }}
      >
        {sections.map((section, index) => {
          const distance = Math.abs(index - activeSection);
          return (
            <button
              aria-current={index === activeSection ? "true" : undefined}
              className={classNames.pickerItem}
              data-active={index === activeSection}
              key={section}
              onClick={() => scrollToSection(index)}
              style={{ "--distance": Math.min(distance, 3) } as CSSProperties}
              type="button"
            >
              {section}
            </button>
          );
        })}
      </div>
    </nav>
    {themeToggle && (
      <div style={{ justifySelf: "end" }}>
        <ThemeToggle theme={themeToggle.theme} onToggle={themeToggle.toggle} />
      </div>
    )}
  </header>
);
