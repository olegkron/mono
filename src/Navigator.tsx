import { type FC, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { HomeScreen } from "./screens/HomeScreen";
import { routes } from "./constants/routes";

const ProjectScreen = lazy(() => import("./screens/ProjectScreen"));

function redirect(url: string) {
  window.location.href = url;
  return null;
}

interface ThemeToggleProps {
  theme: "dark" | "light";
  toggle: () => void;
}

interface NavigatorProps {
  themeToggle?: ThemeToggleProps;
}

function AnimatedRoutes({ themeToggle }: NavigatorProps) {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path={routes.root} element={<HomeScreen themeToggle={themeToggle} />} index />
      <Route path={routes.project} element={
        <Suspense>
          <div key={location.pathname} style={{ animation: "pageFadeIn 220ms ease both" }}>
            <ProjectScreen />
          </div>
        </Suspense>
      } />
      <Route path={routes.portfolio} Component={() => redirect("/assets/docs/portfolio.pdf")} />
      <Route path={routes.cv} Component={() => redirect("/assets/docs/cv.pdf")} />
      <Route path="*" element={<Navigate to={routes.root} />} />
    </Routes>
  );
}

export const Navigator: FC<NavigatorProps> = ({ themeToggle }) => (
  <BrowserRouter>
    <AnimatedRoutes themeToggle={themeToggle} />
  </BrowserRouter>
);
