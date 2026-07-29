"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@shared/ui/Icons";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-[12px] text-muted-foreground hover:bg-muted transition-colors ${className}`}
      aria-label="Переключить тему"
    >
      <span className={theme === "light" ? "block" : "hidden"}>
        <Moon size={18} />
      </span>
      <span className={theme === "dark" ? "block" : "hidden"}>
        <Sun size={18} />
      </span>
    </button>
  );
}
