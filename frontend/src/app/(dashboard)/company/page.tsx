"use client";

import { useUnit } from "effector-react";
import Link from "next/link";
import { $user } from "@features/auth";
import { useQuery } from "@tanstack/react-query";
import { getMyCompanyTasks, TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS } from "@entities/task";
import { Header } from "@widgets/header";
import { Plus, Layers, UserPlus, Clock, Award, Edit, FileText } from "@shared/ui/Icons";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-muted-foreground bg-muted",
  moderation: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
  revision: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400",
  published: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  open: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  selected: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "text-primary bg-primary/10",
  review: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
  rework: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "text-muted-foreground bg-muted",
  archived: "text-muted-foreground bg-muted",
  blocked: "text-destructive bg-destructive/10",
};

export default function CompanyDashboardPage() {
  const user = useUnit($user);
  const companyName = user?.company_name || "Компания";

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["company-tasks"],
    queryFn: getMyCompanyTasks,
    staleTime: 10_000,
  });

  const publishedTasks = tasks.filter(
    (t) => !["draft", "completed", "cancelled", "archived", "blocked"].includes(t.status),
  );
  const inProgressTasks = tasks.filter((t) => ["selected", "in_progress", "review", "rework"].includes(t.status));
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold font-display text-foreground">Обзор</h1>
            <p className="text-[15px] text-muted-foreground mt-1">{companyName}</p>
          </div>
          <Link
            href="/company/tasks/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
          >
            <Plus size={16} />
            Создать задачу
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: publishedTasks.length, label: "Активных задач", icon: Layers },
            { value: tasks.reduce((s, t) => s + (t.status === "open" ? t.participant_count : 0), 0), label: "Новых заявок", icon: UserPlus },
            { value: inProgressTasks.length, label: "В работе", icon: Clock },
            { value: completedCount, label: "Завершено", icon: Award },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-3xl bg-card border border-border text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-[28px] font-bold font-display text-primary">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Tasks */}
        <div>
          <h3 className="text-[18px] font-bold font-display text-foreground mb-4">Последние задачи</h3>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-3xl bg-card border border-border animate-pulse">
                  <div className="h-5 w-2/3 bg-muted/70 rounded-[10px] mb-3" />
                  <div className="flex gap-3">
                    <div className="h-4 w-16 bg-muted/50 rounded-[6px]" />
                    <div className="h-4 w-20 bg-muted/50 rounded-[6px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center rounded-3xl bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
              <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
                <FileText size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-[18px] font-bold font-display text-foreground mb-2">У вас пока нет задач</h3>
              <p className="text-[14px] text-muted-foreground mb-6 max-w-sm">Создайте первую задачу и начните поиск исполнителей</p>
              <Link
                href="/company/tasks/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
              >
                <Plus size={16} />
                Создать первую задачу
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tasks.slice(0, 5).map((task) => {
                const statusClass = STATUS_COLORS[task.status] || "text-muted-foreground bg-muted";
                const deadlineText = task.deadline
                  ? `до ${new Date(task.deadline).toLocaleDateString("ru-RU")}`
                  : null;
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[border-color]"
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <Link href={`/company/tasks/${task.id}`} className="font-semibold text-[15px] text-foreground hover:text-primary transition-colors no-underline min-w-0 truncate">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${statusClass}`}>
                          {TASK_STATUS_LABELS[task.status] || task.status}
                        </span>
                        {["draft", "moderation", "revision", "published", "open"].includes(task.status) && (
                          <Link
                            href={`/company/tasks/${task.id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-[8px] transition-colors no-underline"
                          >
                            <Edit size={11} />
                            <span className="hidden sm:inline">Ред.</span>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                      {task.difficulty && <span>{TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty}</span>}
                      {deadlineText && <><span className="text-muted-foreground/40">·</span><span>{deadlineText}</span></>}
                      <span className="text-muted-foreground/40">·</span>
                      <span>{task.participant_count}/{task.participant_limit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
