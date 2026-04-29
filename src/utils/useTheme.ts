import { useCallback, useEffect, useState } from "react";
import { siteConfig } from "../constants/config";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getInitialTheme(): Theme {
  if (siteConfig.theme.showToggle) {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? getSystemTheme();
  }
  return getSystemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
    if (siteConfig.theme.showToggle) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  // When toggle is hidden, follow system preference changes live
  useEffect(() => {
    if (siteConfig.theme.showToggle) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "light" : "dark");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}
