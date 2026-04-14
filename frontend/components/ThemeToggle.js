"use client";

import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) return <div className="theme-toggle-placeholder" />;

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Toggle Theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === "light" ? "☀️" : "🌙"}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
