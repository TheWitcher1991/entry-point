"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTask, getTaskParticipants, updateTaskStatus, TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS, TASK_FORMAT_LABELS } from "@entities/task";
import { getTaskApplications, updateApplicationStatus, APPLICATION_STATUS_LABELS } from "@entities/application";
import { Header } from "@widgets/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Eye, ArrowLeft, ArrowRight, Clock, Layers, UserPlus, FileText, Check, X as XIcon } from "@shared/ui/Icons";
import type { ApplicationStatus } from "@entities/application";

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

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  review: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
  approved: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  withdrawn: "bg-muted text-muted-foreground",
};

export default function CompanyTaskDetailPage() {
  const params = useParams();
  const taskId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: !Number.isNaN(taskId),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["task-applications", taskId],
    queryFn: () => getTaskApplications(taskId),
    enabled: !Number.isNaN(taskId) && !!task,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["task-participants", taskId],
    queryFn: () => getTaskParticipants(taskId),
    enabled: !Number.isNaN(taskId) && !!task,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      updateApplicationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-applications", taskId] });
      queryClient.invalidateQueries({ queryKey: ["company-applications"] });
    },
  });

  const taskStatusMutation = useMutation({
    mutationFn: (status: string) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["company-tasks"] });
    },
  });

  if (Number.isNaN(taskId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">Задача не найдена</h2>
            <Link href="/company/tasks" className="text-primary hover:underline">Вернуться к задачам</Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
          <Skeleton className="h-4 w-32 mb-6 rounded-[8px]" />
          <Skeleton className="h-8 w-2/3 mb-4 rounded-[10px]" />
          <Skeleton className="h-5 w-48 mb-8 rounded-[8px]" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
            </div>
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">Задача не найдена</h2>
            <p className="text-muted-foreground mb-4">Возможно, задача была удалена</p>
            <Link href="/company/tasks" className="text-primary hover:underline">Вернуться к задачам</Link>
          </div>
        </main>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[task.status] || "text-muted-foreground bg-muted";
  const canEdit = ["draft", "moderation", "revision", "published", "open"].includes(task.status);

  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const difficultyLabel = task.difficulty
    ? (TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty)
    : null;

  const formatLabel = task.format
    ? (TASK_FORMAT_LABELS[task.format as keyof typeof TASK_FORMAT_LABELS] || task.format)
    : null;

  const pendingApplications = applications.filter((a) => a.status === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Back + Edit */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/company/tasks"
            className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors no-underline"
          >
            <ArrowLeft size={16} />
            К задачам
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[10px] transition-colors no-underline"
            >
              <Eye size={14} />
              Публичная страница
            </Link>
            {canEdit && (
              <Link
                href={`/company/tasks/${task.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-[10px] transition-colors no-underline"
              >
                <Edit size={14} />
                Редактировать
              </Link>
            )}
          </div>
        </div>

        {/* Task Header */}
        <div className="p-6 rounded-3xl bg-card border border-border mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[26px] font-bold font-display text-foreground">
                  {task.title}
                </h1>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-medium shrink-0 ${statusColor}`}>
                  {TASK_STATUS_LABELS[task.status] || task.status}
                </span>
              </div>
              {task.summary && (
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {task.summary}
                </p>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            {difficultyLabel && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-muted-foreground">Сложность</span>
                <span className="text-[14px] font-medium text-foreground flex items-center gap-1.5">
                  <Layers size={14} className="text-muted-foreground" />
                  {difficultyLabel}
                </span>
              </div>
            )}
            {formatLabel && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-muted-foreground">Формат</span>
                <span className="text-[14px] font-medium text-foreground">{formatLabel}</span>
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-muted-foreground">Участников</span>
              <span className="text-[14px] font-medium text-foreground flex items-center gap-1.5">
                <UserPlus size={14} className="text-muted-foreground" />
                {task.participant_count}/{task.participant_limit}
              </span>
            </div>
            {deadlineText && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] text-muted-foreground">Дедлайн</span>
                <span className="text-[14px] font-medium text-foreground flex items-center gap-1.5">
                  <Clock size={14} className="text-muted-foreground" />
                  {deadlineText}
                </span>
              </div>
            )}
          </div>

          {/* Skills */}
          {task.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {task.skills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[12px] font-medium"
                >
                  {s.skill_name || `Навык #${s.skill_id}`}
                  {s.level && ` · ${s.level}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* LEFT: Content */}
          <div className="flex flex-col gap-6">
            {/* Applications Section */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold font-display text-foreground flex items-center gap-2">
                  Заявки
                  {pendingApplications.length > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
                      {pendingApplications.length}
                    </span>
                  )}
                </h2>
                <Link
                  href="/company/applications"
                  className="text-[13px] text-primary hover:underline no-underline"
                >
                  Все заявки
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText size={32} strokeWidth={1.5} className="text-muted-foreground mb-3" />
                  <p className="text-[14px] text-muted-foreground">Заявок пока нет</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-border p-4 hover:border-muted-foreground/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback className="text-sm">
                              {app.participant_first_name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="text-[14px] font-semibold text-foreground truncate">
                              {app.participant_first_name} {app.participant_last_name}
                            </h4>
                            <p className="text-[12px] text-muted-foreground">
                              {new Date(app.created_at).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                          APPLICATION_STATUS_COLORS[app.status] || "bg-muted text-muted-foreground"
                        }`}>
                          {APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] || app.status}
                        </span>
                      </div>

                      {app.cover_letter && (
                        <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed line-clamp-2 ml-[52px]">
                          {app.cover_letter}
                        </p>
                      )}

                      {app.status === "pending" && (
                        <div className="flex gap-2 mt-3 ml-[52px]">
                          <button
                            onClick={() => statusMutation.mutate({ id: app.id, status: "approved" })}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-medium text-white bg-emerald-600 hover:opacity-90 rounded-[8px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
                          >
                            <Check size={12} />
                            Одобрить
                          </button>
                          <button
                            onClick={() => statusMutation.mutate({ id: app.id, status: "rejected" })}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-[12px] font-medium text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-[8px] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XIcon size={12} />
                            Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participants Section */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <h2 className="text-[18px] font-bold font-display text-foreground mb-5 flex items-center gap-2">
                Участники
                {participants.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                    {participants.length}
                  </span>
                )}
              </h2>

              {participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <UserPlus size={32} strokeWidth={1.5} className="text-muted-foreground mb-3" />
                  <p className="text-[14px] text-muted-foreground">Участников пока нет</p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Одобрите заявки, чтобы добавить участников
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {participants.map((p) => (
                    <Link
                      key={p.id}
                      href={`/participants/${p.participant_id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors no-underline group"
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        {p.participant_avatar_url ? (
                          <AvatarImage src={p.participant_avatar_url} alt={p.participant_first_name || ""} />
                        ) : null}
                        <AvatarFallback className="text-sm">
                          {p.participant_first_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {p.participant_first_name} {p.participant_last_name}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {p.status === "active" ? "Активен" : p.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Status Actions Card */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Управление задачей</h3>
              <div className="flex flex-col gap-3">
                {task.status === "open" && (
                  <button
                    onClick={() => taskStatusMutation.mutate("in_progress")}
                    disabled={taskStatusMutation.isPending}
                    className="w-full h-[44px] inline-flex items-center justify-center gap-2 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRight size={14} />
                    Начать работу
                  </button>
                )}
                {task.status === "rework" && (
                  <button
                    onClick={() => taskStatusMutation.mutate("in_progress")}
                    disabled={taskStatusMutation.isPending}
                    className="w-full h-[44px] inline-flex items-center justify-center gap-2 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRight size={14} />
                    Вернуть в работу
                  </button>
                )}
                {(task.status === "completed" || task.status === "cancelled") && (
                  <button
                    onClick={() => taskStatusMutation.mutate("archived")}
                    disabled={taskStatusMutation.isPending}
                    className="w-full h-[44px] inline-flex items-center justify-center gap-2 text-[14px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Архивировать
                  </button>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Детали</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Статус</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}>
                    {TASK_STATUS_LABELS[task.status] || task.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Заявок</span>
                  <span className="text-[13px] font-medium text-foreground">{applications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Участников</span>
                  <span className="text-[13px] font-medium text-foreground">{participants.length}/{task.participant_limit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Создана</span>
                  <span className="text-[13px] font-medium text-foreground">
                    {new Date(task.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
