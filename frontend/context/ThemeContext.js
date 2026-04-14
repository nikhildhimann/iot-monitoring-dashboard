"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const manualFlag = localStorage.getItem("theme_manual") === "true";
    
    if (storedTheme) {
      setTheme(storedTheme);
      setIsManual(manualFlag);
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isManual) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isManual]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme_manual", isManual.toString());
  }, [theme, mounted, isManual]);

  const toggleTheme = () => {
    setIsManual(true);
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted, isManual }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
