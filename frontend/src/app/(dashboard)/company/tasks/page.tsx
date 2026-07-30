"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { getMyCompanyTasks, getTaskParticipants } from "@entities/task";
import type { TaskParticipant } from "@entities/task";
import { TASK_STATUS_LABELS } from "@entities/task";
import { Header } from "@widgets/header";
import { Plus, Clock, Layers, UserPlus, Edit, Eye, FileText } from "@shared/ui/Icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

  // Fetch participants for active tasks that have participants
  const activeParticipantStatuses = ["selected", "in_progress", "review", "rework"];
  const tasksWithParticipants = tasks.filter(
    (t) => activeParticipantStatuses.includes(t.status) && t.participant_count > 0,
  );
  const participantsQueries = useQueries({
    queries: tasksWithParticipants.map((task) => ({
      queryKey: ["task-participants", task.id],
      queryFn: () => getTaskParticipants(task.id),
      staleTime: 30_000,
    })),
  });
  const participantsByTaskId: Record<number, TaskParticipant[]> = {};
  tasksWithParticipants.forEach((task, index) => {
    if (participantsQueries[index]?.data) {
      participantsByTaskId[task.id] = participantsQueries[index].data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
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

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary flex items-center gap-2">
            Мои задачи
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              {tasks.length}
            </span>
          </span>
          <Link
            href="/company/applications"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Заявки
          </Link>
          <Link
            href="/company/submissions"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Результаты
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
              <div key={stat.label} className="p-5 rounded-3xl bg-card border border-border text-center">
                <Icon size={20} className={`${stat.color} mx-auto mb-2`} strokeWidth={1.5} />
                {isLoading ? (
                  <div className="h-7 w-12 bg-muted/70 rounded-[8px] mx-auto mb-2 animate-pulse" />
                ) : (
                  <div className="text-[28px] font-bold font-display text-foreground">{stat.value}</div>
                )}
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-3xl bg-card border border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-5 w-48 bg-muted/70 rounded-[8px]" />
                      <div className="h-5 w-20 bg-muted/50 rounded-full" />
                    </div>
                    <div className="h-4 w-full bg-muted/50 rounded-[8px] mb-3" />
                    <div className="flex gap-4">
                      <div className="h-4 w-16 bg-muted/50 rounded-[6px]" />
                      <div className="h-4 w-20 bg-muted/50 rounded-[6px]" />
                      <div className="h-4 w-24 bg-muted/50 rounded-[6px]" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted/50 rounded-[10px]" />
                  </div>
                </div>
              </div>
            ))}
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
                  className="p-5 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-colors"
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

                      {/* Participants */}
                      {participantsByTaskId[task.id]?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex flex-wrap gap-2">
                            {participantsByTaskId[task.id].map((p) => (
                              <Link
                                key={p.id}
                                href={`/participants/${p.participant_id}`}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted hover:bg-muted/70 transition-[background-color,scale] duration-150 ease-out no-underline active:scale-[0.96]"
                              >
                                <Avatar size="sm">
                                  {p.participant_avatar_url ? (
                                    <AvatarImage
                                      src={p.participant_avatar_url}
                                      alt={p.participant_first_name || ""}
                                    />
                                  ) : null}
                                  <AvatarFallback>
                                    {p.participant_first_name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[13px] text-foreground">
                                  {p.participant_first_name}{" "}
                                  {p.participant_last_name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
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
