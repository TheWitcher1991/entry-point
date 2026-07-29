"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { getMyCompanyTasks } from "@entities/task";
import { TASK_STATUS_LABELS } from "@entities/task";
import { Header } from "@widgets/header";
import { Plus, Clock, Layers, UserPlus, Edit, Eye, Trash, FileText } from "@shared/ui/Icons";

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

export default function CompanyTasksPage() {
  const user = useUnit($user);
  const companyName = user?.company_name || "Компания";

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["company-tasks"],
    queryFn: getMyCompanyTasks,
    staleTime: 10_000,
  });

  const activeTasks = tasks.filter(
    (t) => !["draft", "completed", "cancelled", "archived"].includes(t.status),
  );
  const draftTasks = tasks.filter((t) => t.status === "draft");
  const completedTasks = tasks.filter(
    (t) => ["completed", "cancelled", "archived"].includes(t.status),
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold font-display text-foreground">Задачи</h1>
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { value: activeTasks.length, label: "Активных", icon: Layers, color: "text-primary" },
            { value: draftTasks.length, label: "Черновиков", icon: FileText, color: "text-muted-foreground" },
            { value: completedTasks.length, label: "Завершённых", icon: Clock, color: "text-green-600" },
            { value: tasks.reduce((s, t) => s + t.participant_count, 0), label: "Участников", icon: UserPlus, color: "text-primary" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-[20px] bg-card border border-border text-center">
                <Icon size={20} className={`${stat.color} mx-auto mb-2`} strokeWidth={1.5} />
                <div className="text-[28px] font-bold font-display text-foreground">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-[15px] text-muted-foreground">Загрузка задач...</div>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={40} strokeWidth={1.5} className="text-muted-foreground mb-4" />
            <h3 className="text-[18px] font-semibold text-foreground mb-2">У вас пока нет задач</h3>
            <p className="text-[14px] text-muted-foreground mb-6">Создайте первую задачу и начните поиск исполнителей</p>
            <Link
              href="/company/tasks/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
            >
              <Plus size={16} />
              Создать задачу
            </Link>
          </div>
        ) : (
          /* Tasks List */
          <div className="flex flex-col gap-4">
            {tasks.map((task) => {
              const statusColor = STATUS_COLORS[task.status] || "text-muted-foreground bg-muted";
              return (
                <div
                  key={task.id}
                  className="p-5 rounded-[20px] bg-card border border-border hover:border-muted-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-[16px] font-semibold text-foreground truncate">
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statusColor}`}>
                          {TASK_STATUS_LABELS[task.status] || task.status}
                        </span>
                      </div>

                      {task.summary && (
                        <p className="text-[14px] text-muted-foreground line-clamp-1 mb-3">
                          {task.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers size={14} />
                          {task.difficulty || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserPlus size={14} />
                          {task.participant_count}/{task.participant_limit}
                        </span>
                        {task.deadline && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            до {new Date(task.deadline).toLocaleDateString("ru-RU")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[10px] transition-colors no-underline"
                      >
                        <Eye size={14} />
                        Просмотр
                      </Link>
                      {task.status === "draft" && (
                        <Link
                          href={`/company/tasks/${task.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-[10px] transition-colors no-underline"
                        >
                          <Edit size={14} />
                          Редактировать
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
