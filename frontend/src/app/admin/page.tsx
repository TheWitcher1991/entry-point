"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user, $isHydrated } from "@features/auth";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "@entities/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Layers,
  Users,
  Briefcase,
  Activity,
  Shield,
  TrendingUp,
  Award,
  Building,
  FileText,
  Star,
} from "@shared/ui/Icons";

const STAT_CARDS = [
  { key: "participants" as const, label: "Участников", icon: Users, color: "text-blue-600 dark:text-blue-400" },
  { key: "companies" as const, label: "Компаний", icon: Briefcase, color: "text-violet-600 dark:text-violet-400" },
  { key: "open_tasks" as const, label: "Открытых задач", icon: Layers, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "completed_tasks" as const, label: "Выполнено задач", icon: Award, color: "text-green-600 dark:text-green-400" },
  { key: "active_tasks" as const, label: "В работе", icon: Activity, color: "text-amber-600 dark:text-amber-400" },
  { key: "total_reviews" as const, label: "Отзывов", icon: Star, color: "text-yellow-600 dark:text-yellow-400" },
];

export default function AdminDashboardPage() {
  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (isHydrated && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md" />
        <main className="flex-1 max-w-[1200px] mx-auto px-6 py-8 w-full">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-7 w-7 rounded-[8px]" />
            <Skeleton className="h-8 w-72" />
          </div>
          <Skeleton className="h-4 w-56 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-card border border-border">
                <Skeleton className="h-6 w-6 rounded-[8px] mb-3" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="h-6 w-40 mb-5" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </main>
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={28} className="text-primary" strokeWidth={1.5} />
              <h1 className="text-[28px] font-bold font-display text-foreground">
                Панель администратора
              </h1>
            </div>
            <p className="text-[15px] text-muted-foreground">
              Управление платформой и модерация контента
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {STAT_CARDS.map((stat) => {
              const Icon = stat.icon;
              const value = stats ? stats[stat.key] : "—";
              return (
                <div
                  key={stat.key}
                  className="p-6 rounded-3xl bg-card border border-border"
                >
                  <Icon
                    size={24}
                    className={`${stat.color} mb-3`}
                    strokeWidth={1.5}
                  />
                  <div className="text-[32px] font-bold font-display text-foreground tabular-nums">
                    {statsLoading ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      value
                    )}
                  </div>
                  <div className="text-[13px] text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Moderation Section */}
          <div className="mb-8">
            <h2 className="text-[20px] font-bold font-display text-foreground mb-5 flex items-center gap-2">
              <Activity size={20} className="text-primary" strokeWidth={1.5} />
              Управление
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/tasks"
                className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-[border-color] no-underline block active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Layers size={22} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-foreground">
                      Модерация задач
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Проверка и публикация задач от компаний
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
                  <TrendingUp size={14} strokeWidth={1.5} />
                  Перейти
                </div>
              </Link>

              <Link
                href="/admin/companies"
                className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-[border-color] no-underline block active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building size={22} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-foreground">
                      Компании
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Верификация и управление профилями
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
                  <TrendingUp size={14} strokeWidth={1.5} />
                  Перейти
                </div>
              </Link>

              <Link
                href="/admin/directories"
                className="p-6 rounded-3xl bg-card border border-border hover:border-primary/30 transition-[border-color] no-underline block active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText size={22} className="text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-foreground">
                      Справочники
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Категории и навыки
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-primary">
                  <TrendingUp size={14} strokeWidth={1.5} />
                  Перейти
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
