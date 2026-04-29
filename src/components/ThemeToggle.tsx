import type { FC } from "react";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ theme, onToggle }) => (
  <button
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    onClick={onToggle}
    style={{
      background: "none",
      border: "none",
      color: "var(--color-primary-dark)",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: "0.75rem",
      padding: 0,
      pointerEvents: "auto",
    }}
    type="button"
  >
    {theme === "dark" ? "light" : "dark"}
  </button>
);
