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
      className={`inline-flex items-center justify-center w-10 h-10 rounded-[12px] text-muted-foreground hover:bg-muted transition-colors relative ${className}`}
      aria-label="Переключить тему"
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-[scale,opacity] duration-200 ease-out"
        style={{
          scale: theme === "light" ? "1" : "0.25",
          opacity: theme === "light" ? 1 : 0,
        }}
      >
        <Moon size={18} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-[scale,opacity] duration-200 ease-out"
        style={{
          scale: theme === "dark" ? "1" : "0.25",
          opacity: theme === "dark" ? 1 : 0,
        }}
      >
        <Sun size={18} />
      </span>
    </button>
  );
}
