import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("va-theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("va-theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };
}

export function useA11ySettings() {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("va-contrast") === "high";
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("va-motion") === "reduce";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("contrast-high", highContrast);
    window.localStorage.setItem("va-contrast", highContrast ? "high" : "normal");
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    window.localStorage.setItem("va-motion", reduceMotion ? "reduce" : "normal");
  }, [reduceMotion]);

  return { highContrast, setHighContrast, reduceMotion, setReduceMotion };
}
