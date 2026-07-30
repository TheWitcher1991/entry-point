"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUnit } from "effector-react";
import { $user, $isAuthenticated, $isHydrated, logout } from "@features/auth";
import { ThemeToggle } from "@shared/ui/ThemeToggle";
import { LogIn, User, LogOut, Menu as MenuIcon, X as XIcon, Bookmark, Layers, UserPlus, FileText, Users, Building } from "@shared/ui/Icons";
import { NotificationBell } from "@widgets/notification-bell";

const publicLinks = [
  { href: "/catalog" as const, label: "Задачи", icon: Layers },
  { href: "/companies" as const, label: "Компании", icon: Building },
  { href: "/how-it-works" as const, label: "Как это работает", icon: undefined },
];

const companyLinks = [
  { href: "/company/tasks" as const, label: "Задачи", icon: Layers },
  { href: "/company/applications" as const, label: "Заявки", icon: UserPlus },
  { href: "/company/submissions" as const, label: "Результаты", icon: FileText },
  { href: "/company/participants" as const, label: "Участники", icon: Users },
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

  const navLinks =
    isHydrated && isAuthenticated && user?.role === "company"
      ? companyLinks
      : publicLinks;

  return (
    <header className="sticky top-4 z-50 w-full max-w-[1200px] mx-auto rounded-2xl backdrop-blur-lg shadow-[0px_0px_0px_1px_oklch(0_0_0_/_0.06),0px_1px_2px_-1px_oklch(0_0_0_/_0.06),0px_2px_4px_0px_oklch(0_0_0_/_0.04)] header-glass">
      <div className="flex items-center justify-between h-[72px] px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/logo.png"
            alt="Точка входа"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="text-[20px] font-bold text-primary font-display hidden sm:inline">
            Точка входа
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-[15px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-[12px] transition-colors no-underline flex items-center gap-2"
              >
                {Icon && <Icon size={16} strokeWidth={1.5} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isHydrated && isAuthenticated && (
            <>
              <Link
                href="/saved"
                className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-primary hover:bg-muted rounded-[12px] transition-colors no-underline"
                title="Сохранённые"
              >
                <Bookmark size={18} />
              </Link>
              <NotificationBell />
            </>
          )}
          <ThemeToggle />

          {isHydrated && isAuthenticated && user ? (
            <>
              <Link
                href={user.role === "company" ? "/company/tasks" : "/participant"}
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
              <Link
                href={user.role === "company" ? "/company/profile" : "/participant/profile"}
                className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[14px] font-semibold shrink-0 no-underline hover:opacity-80 transition-opacity"
                title="Профиль"
              >
                {user.first_name?.[0] || user.email[0].toUpperCase()}
              </Link>
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
        <div className="md:hidden border-t border-border bg-card px-4 sm:px-6 py-4 flex flex-col gap-1 animate-fadeIn rounded-b-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[15px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-[12px] transition-colors no-underline flex items-center gap-3"
              >
                {Icon && <Icon size={16} strokeWidth={1.5} />}
                {link.label}
              </Link>
            );
          })}
          <hr className="my-2 border-border" />
          {isHydrated && isAuthenticated && user ? (
            <>
              <Link
                href={user.role === "company" ? "/company/tasks" : "/participant"}
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
