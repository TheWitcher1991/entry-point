"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user, $isHydrated } from "@features/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminTasks, updateTaskStatus } from "@entities/admin";
import type { AdminTask } from "@entities/admin";
import { TASK_STATUS_LABELS } from "@entities/task";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Check,
  X,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Eye,
  Activity,
} from "@shared/ui/Icons";

const TABS = [
  { key: "moderation", label: "На модерации" },
  { key: "revision", label: "На доработке" },
  { key: "published", label: "Опубликованы" },
  { key: "open", label: "Набор" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  moderation: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  revision: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  published: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  open: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  selected: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  rework: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-muted text-muted-foreground",
  archived: "bg-muted text-muted-foreground",
  blocked: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Для начинающих",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

function TaskModerationCard({
  task,
  onAction,
  loadingAction,
}: {
  task: AdminTask;
  onAction: (taskId: number, status: string) => void;
  loadingAction: string | null;
}) {
  const statusLabel = TASK_STATUS_LABELS[task.status as keyof typeof TASK_STATUS_LABELS] || task.status;
  const badgeClass = STATUS_BADGE[task.status] || "bg-muted text-muted-foreground";
  const difficultyLabel = task.difficulty
    ? DIFFICULTY_LABELS[task.difficulty] || task.difficulty
    : null;

  const createdDate = new Date(task.created_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 rounded-3xl bg-card border border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-semibold text-foreground">
              {task.company_name || "Неизвестная компания"}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <h3 className="text-[17px] font-semibold text-foreground leading-snug">
            {task.title}
          </h3>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground mb-4">
        {difficultyLabel && (
          <span className="flex items-center gap-1">
            <Clock size={13} strokeWidth={1.5} />
            {difficultyLabel}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={13} strokeWidth={1.5} />
          {createdDate}
        </span>
      </div>

      {/* Summary */}
      {task.summary && (
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-5 line-clamp-2">
          {task.summary}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
        {task.status === "moderation" && (
          <>
            <button
              onClick={() => onAction(task.id, "published")}
              disabled={loadingAction === `${task.id}-published`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingAction === `${task.id}-published` ? (
                <Activity size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Опубликовать
            </button>
            <button
              onClick={() => onAction(task.id, "revision")}
              disabled={loadingAction === `${task.id}-revision`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingAction === `${task.id}-revision` ? (
                <Activity size={14} className="animate-spin" />
              ) : (
                <AlertTriangle size={14} />
              )}
              На доработку
            </button>
            <button
              onClick={() => onAction(task.id, "blocked")}
              disabled={loadingAction === `${task.id}-blocked`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <X size={14} />
              Заблокировать
            </button>
          </>
        )}
        {task.status === "revision" && (
          <>
            <button
              onClick={() => onAction(task.id, "published")}
              disabled={loadingAction === `${task.id}-published`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check size={14} />
              Одобрить
            </button>
            <button
              onClick={() => onAction(task.id, "blocked")}
              disabled={loadingAction === `${task.id}-blocked`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <X size={14} />
              Заблокировать
            </button>
          </>
        )}
        {task.status === "published" && (
          <>
            <button
              onClick={() => onAction(task.id, "open")}
              disabled={loadingAction === `${task.id}-open`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check size={14} />
              Открыть набор
            </button>
            <button
              onClick={() => onAction(task.id, "blocked")}
              disabled={loadingAction === `${task.id}-blocked`}
              className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <X size={14} />
              Заблокировать
            </button>
          </>
        )}
        {task.status === "open" && (
          <button
            onClick={() => onAction(task.id, "blocked")}
            disabled={loadingAction === `${task.id}-blocked`}
            className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <X size={14} />
            Заблокировать
          </button>
        )}
        {!["moderation", "revision", "published", "open"].includes(task.status) && (
          <span className="text-[13px] text-muted-foreground">
            Нет доступных действий
          </span>
        )}
        <Link
          href={`/tasks/${task.id}`}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-[10px] hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] no-underline"
        >
          <Eye size={14} strokeWidth={1.5} />
          Просмотр
        </Link>
      </div>
    </div>
  );
}

export default function AdminTasksPage() {
  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("moderation");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin-tasks", { status: activeTab }],
    queryFn: () => getAdminTasks({ status: activeTab, limit: 50 }),
    staleTime: 10_000,
  });

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      setLoadingAction(null);
    },
    onError: () => {
      setLoadingAction(null);
    },
  });

  const handleAction = (taskId: number, status: string) => {
    const actionKey = `${taskId}-${status}`;
    setLoadingAction(actionKey);
    mutation.mutate({ taskId, status });
  };

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
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="flex gap-1 mb-6 border-b border-border">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-none rounded-t-[8px]" />
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-card border border-border">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-5" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-[12px]" />
                  <Skeleton className="h-9 w-28 rounded-[12px]" />
                </div>
              </div>
            ))}
          </div>
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
          {/* Back Link */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground no-underline mb-6 transition-colors active:scale-[0.96]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Назад к панели
          </Link>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-[28px] font-bold font-display text-foreground mb-2">
              Модерация задач
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Проверка и управление статусами задач от компаний
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-[14px] font-medium whitespace-nowrap bg-transparent cursor-pointer border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task List */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-card border border-border animate-pulse"
                >
                  <div className="h-5 w-1/3 bg-muted/70 rounded-[8px] mb-3" />
                  <div className="h-4 w-2/3 bg-muted/50 rounded-[8px] mb-2" />
                  <div className="h-4 w-1/2 bg-muted/30 rounded-[8px] mb-5" />
                  <div className="flex gap-2">
                    <div className="h-9 w-28 bg-muted/50 rounded-[12px]" />
                    <div className="h-9 w-28 bg-muted/50 rounded-[12px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Check size={40} strokeWidth={1.5} className="text-muted-foreground mb-4" />
              <h3 className="text-[18px] font-semibold text-foreground mb-2">
                Нет задач в этом статусе
              </h3>
              <p className="text-muted-foreground text-[14px]">
                {activeTab === "moderation"
                  ? "Новые задачи от компаний появятся здесь"
                  : "Задачи в этом статусе отсутствуют"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tasks.map((task) => (
                <TaskModerationCard
                  key={task.id}
                  task={task}
                  onAction={handleAction}
                  loadingAction={loadingAction}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
