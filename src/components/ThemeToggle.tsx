"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zericard_theme") as "dark" | "light" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentTheme = saved || (systemDark ? "dark" : "light");

    setTheme(currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("zericard_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    // Notify other components like HyperspaceCanvas of theme change
    window.dispatchEvent(new CustomEvent("zericard_theme_change", { detail: nextTheme }));
  };

  if (!mounted) {
    return (
      <button
        className="y2k-btn y2k-btn-ghost"
        style={{ padding: "4px 8px", fontSize: "10px" }}
      >
        [ MODE ]
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="y2k-btn y2k-btn-ghost"
      style={{
        padding: "4px 10px",
        fontSize: "10px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        borderColor: theme === "dark" ? "var(--cyan)" : "var(--border-accent)",
        color: theme === "dark" ? "var(--cyan)" : "var(--silver)",
      }}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <span>{theme === "dark" ? "🌙 DARK" : "☀️ LIGHT"}</span>
    </button>
  );
}
