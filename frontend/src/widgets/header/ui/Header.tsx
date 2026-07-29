"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user, $isAuthenticated, $isHydrated, logout } from "@features/auth";
import { ThemeToggle } from "@shared/ui/ThemeToggle";
import { LogIn, User, LogOut, Menu as MenuIcon, X as XIcon } from "@shared/ui/Icons";

const navLinks = [
  { href: "/catalog", label: "Задачи" },
  { href: "/companies", label: "Компании" },
  { href: "/how-it-works", label: "Как это работает" },
];

export function Header() {
  const user = useUnit($user);
  const isAuthenticated = useUnit($isAuthenticated);
  const isHydrated = useUnit($isHydrated);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-[10px] bg-primary flex items-center justify-center text-white shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <span className="text-[20px] font-bold text-primary font-display hidden sm:inline">
            Точка входа
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[15px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-[12px] transition-colors no-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isHydrated && isAuthenticated && user ? (
            <>
              <Link
                href={user.role === "company" ? "/company" : "/participant"}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-foreground bg-muted hover:bg-muted rounded-[12px] transition-colors no-underline"
              >
                <User size={16} />
                Кабинет
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[12px] transition-colors"
                title="Выйти"
              >
                <LogOut size={18} />
              </button>
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[14px] font-semibold shrink-0">
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors no-underline"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity no-underline"
              >
                Регистрация
              </Link>
            </>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:bg-muted rounded-[12px] transition-colors"
            aria-label="Меню"
          >
            {mobileOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-1 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-[15px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-[12px] transition-colors no-underline"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border" />
          {isHydrated && isAuthenticated && user ? (
            <>
              <Link
                href={user.role === "company" ? "/company" : "/participant"}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[15px] text-foreground font-medium hover:bg-muted rounded-[12px] transition-colors no-underline"
              >
                <User size={16} className="inline mr-2" />
                Кабинет
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-3 text-[15px] text-muted-foreground hover:bg-muted rounded-[12px] transition-colors text-left"
              >
                <LogOut size={16} className="inline mr-2" />
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[15px] text-foreground font-medium hover:bg-muted rounded-[12px] transition-colors no-underline"
              >
                <LogIn size={16} className="inline mr-2" />
                Войти
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[15px] text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity text-center no-underline"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
