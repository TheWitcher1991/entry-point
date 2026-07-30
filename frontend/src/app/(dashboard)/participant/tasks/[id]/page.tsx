"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "effector-react";
import { useQuery } from "@tanstack/react-query";
import { $user, $isHydrated } from "@features/auth";
import { getTask, TASK_DIFFICULTY_LABELS } from "@entities/task";
import { getMyParticipations, type Participation } from "@entities/participation";
import { getTaskSubmissions, type Submission } from "@entities/submission";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { SubmitForm } from "@features/task-submit";
import { ChevronRight, Check, Clock, Layers, ExternalLink, Briefcase } from "@shared/ui/Icons";

/* ── Helpers ── */

function getDifficultyLabel(difficulty: string | null): string | null {
  if (!difficulty) return null;
  return TASK_DIFFICULTY_LABELS[difficulty as keyof typeof TASK_DIFFICULTY_LABELS] ?? difficulty;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Loading Skeleton ── */

function WorkspaceSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      {/* Breadcrumbs skeleton */}
      <div className="h-4 w-64 bg-muted/70 rounded-[8px]" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="flex flex-col gap-6">
          <div className="h-8 w-3/4 bg-muted/70 rounded-[10px]" />
          <div className="h-4 w-1/3 bg-muted/50 rounded-[8px]" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted/50 rounded-full" />
            <div className="h-6 w-24 bg-muted/50 rounded-full" />
          </div>
          <div className="h-40 w-full bg-muted/30 rounded-[16px]" />
          <div className="h-24 w-full bg-muted/30 rounded-[16px]" />
        </div>
        <div className="h-72 w-full bg-muted/30 rounded-[24px]" />
      </div>
    </div>
  );
}

/* ── Status Badge ── */

function SubmissionsStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "На проверке",
      classes: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
    approved: {
      label: "Принято",
      classes: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    rejected: {
      label: "На доработке",
      classes: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    in_progress: {
      label: "В работе",
      classes: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
    },
  };

  const c = config[status] ?? { label: status, classes: "bg-muted text-muted-foreground" };

  return (
    <span className={`inline-flex items-center h-7 px-3 rounded-full text-[13px] font-medium ${c.classes}`}>
      {c.label}
    </span>
  );
}

/* ── Main Page ── */

export default function ParticipantTaskWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);

  // ── Auth guard ──
  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "participant") {
      router.replace("/participant");
      return;
    }
  }, [isHydrated, user, router]);

  // ── Data fetching ──
  const { data: participations = [], isLoading: partsLoading } = useQuery({
    queryKey: ["my-participations"],
    queryFn: getMyParticipations,
    enabled: isHydrated && !!user && user.role === "participant",
  });

  const {
    data: task,
    isLoading: taskLoading,
    isError: taskError,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: !Number.isNaN(taskId),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["task-submissions", taskId],
    queryFn: () => getTaskSubmissions(taskId),
    enabled: !Number.isNaN(taskId) && !!user,
  });

  // ── Derived state ──
  const participation = participations.find(
    (p: Participation) => p.task_id === taskId,
  );

  const mySubmission: Submission | undefined = submissions.find(
    (s: Submission) => s.participant_id === user?.id,
  );

  const isLoading = !isHydrated || partsLoading || taskLoading;

  // ── Invalid ID ──
  if (Number.isNaN(taskId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">
              Задача не найдена
            </h2>
            <Link href="/participant" className="text-primary hover:underline">
              Вернуться в кабинет
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1200px] mx-auto px-6 py-8 w-full">
          <WorkspaceSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // ── Task error ──
  if (taskError || !task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">
              Задача не найдена
            </h2>
            <p className="text-muted-foreground mb-4">
              Возможно, задача была удалена или у вас нет доступа
            </p>
            <Link href="/participant" className="text-primary hover:underline">
              Вернуться в кабинет
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── No participation ──
  if (!participation) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-[400px]">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">
              Нет активного участия
            </h2>
            <p className="text-muted-foreground mb-6">
              У вас нет активного участия в этой задаче
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-opacity no-underline"
            >
              <Briefcase size={16} />
              Найти задачи
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Workspace render helpers ──

  const difficultyLabel = getDifficultyLabel(task.difficulty);
  const deadlineText = formatDate(task.deadline);

  const renderRightColumn = () => {
    const taskStatus = task.status;

    /* In progress — no submission yet */
    if (taskStatus === "in_progress" && !mySubmission) {
      return (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <div className="w-10 h-10 rounded-[12px] bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Clock size={20} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-foreground">Задача в работе</div>
              <div className="text-[13px] text-muted-foreground">Отправьте результат на проверку</div>
            </div>
          </div>
          <SubmitForm taskId={task.id} />
        </div>
      );
    }

    /* Under review */
    if (taskStatus === "review" || (taskStatus === "in_progress" && mySubmission?.status === "pending")) {
      return (
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-[20px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[12px] bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
                <Clock size={20} strokeWidth={1.5} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-foreground">Результат на проверке</div>
                <div className="text-[13px] text-muted-foreground">Компания проверяет ваш результат</div>
              </div>
            </div>

            {mySubmission?.description && (
              <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-700/50">
                <div className="text-[13px] font-medium text-foreground mb-1">Ваш результат:</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                  {mySubmission.description}
                </p>
              </div>
            )}

            {mySubmission?.result_links && (
              <div className="mt-2">
                <div className="text-[13px] font-medium text-foreground mb-1">Ссылки:</div>
                <p className="text-[13px] text-primary break-all">{mySubmission.result_links}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    /* Rework — task returned for revision */
    if (taskStatus === "rework") {
      return (
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-[20px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[12px] bg-red-100 dark:bg-red-800/40 flex items-center justify-center">
                <Check size={20} strokeWidth={1.5} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-foreground">Задача возвращена на доработку</div>
                <div className="text-[13px] text-muted-foreground">Ознакомьтесь с комментарием и отправьте исправленный результат</div>
              </div>
            </div>

            {mySubmission?.review_comment && (
              <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-700/50">
                <div className="text-[13px] font-medium text-foreground mb-1">Комментарий компании:</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {mySubmission.review_comment}
                </p>
              </div>
            )}
          </div>

          <SubmitForm taskId={task.id} />
        </div>
      );
    }

    /* Completed */
    if (taskStatus === "completed") {
      return (
        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-[20px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[12px] bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center">
                <Check size={20} strokeWidth={1.5} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-foreground">Задача завершена</div>
                <div className="text-[13px] text-muted-foreground">Поздравляем с успешным выполнением!</div>
              </div>
            </div>

            {mySubmission?.review_comment && (
              <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-700/50">
                <div className="text-[13px] font-medium text-foreground mb-1">Отзыв компании:</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {mySubmission.review_comment}
                </p>
              </div>
            )}

            {mySubmission?.description && (
              <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-700/50">
                <div className="text-[13px] font-medium text-foreground mb-1">Ваш результат:</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">
                  {mySubmission.description}
                </p>
              </div>
            )}
          </div>

          <Link
            href="/participant"
            className="inline-flex items-center justify-center h-[44px] text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors no-underline"
          >
            Вернуться в кабинет
          </Link>
        </div>
      );
    }

    /* Fallback for other statuses */
    return (
      <div className="flex flex-col gap-5">
        <div className="p-5 rounded-[20px] bg-muted border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-muted/70 flex items-center justify-center">
              <Clock size={20} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-foreground">
                Статус: {task.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ──

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border pt-6">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors no-underline">
              Главная
            </Link>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <Link href="/participant" className="hover:text-primary transition-colors no-underline">
              Кабинет
            </Link>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Активные задачи</span>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <span className="text-foreground truncate">{task.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* ── LEFT: Task Info ── */}
            <div>
              {/* Company + Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center text-[22px] font-bold shrink-0">
                  {task.company_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="font-semibold text-[15px] text-foreground">
                    {task.company_name || "Компания"}
                  </div>
                  {deadlineText && (
                    <div className="text-[13px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock size={14} strokeWidth={1.5} />
                      Срок: {deadlineText}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-[32px] font-bold font-display text-foreground leading-tight mb-6">
                {task.title}
              </h1>

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-8">
                {task.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[13px] font-medium"
                  >
                    {s.skill_name || `#${s.skill_id}`}
                    {s.level && ` · ${s.level}`}
                  </span>
                ))}
                {difficultyLabel && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[13px] font-medium">
                    <Layers size={14} className="mr-1.5" strokeWidth={1.5} />
                    {difficultyLabel}
                  </span>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">
                    Описание задачи
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {task.description}
                  </div>
                </div>
              )}

              {/* Summary */}
              {task.summary && (
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">
                    Кратко
                  </h3>
                  <div className="text-muted-foreground leading-relaxed">
                    {task.summary}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {task.requirements && (
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">
                    Требования
                  </h3>
                  <div className="flex flex-col gap-3">
                    {task.requirements.split("\n").filter(Boolean).map((req, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[15px] text-muted-foreground leading-relaxed">
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Result */}
              {task.expected_result && (
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">
                    Ожидаемый результат
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {task.expected_result}
                  </div>
                </div>
              )}

              {/* Acceptance Criteria */}
              {task.acceptance_criteria && (
                <div className="mb-8">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">
                    Критерии приёмки
                  </h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {task.acceptance_criteria}
                  </div>
                </div>
              )}

              {/* Extra info: materials, tools, policies */}
              <div className="flex flex-col gap-6 mb-8">
                {task.materials_links && (
                  <div>
                    <h4 className="text-[14px] font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ExternalLink size={16} strokeWidth={1.5} />
                      Ссылки и материалы
                    </h4>
                    <div className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">
                      {task.materials_links}
                    </div>
                  </div>
                )}

                {task.restrictions && (
                  <div>
                    <h4 className="text-[14px] font-semibold text-foreground mb-2">Ограничения</h4>
                    <div className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">
                      {task.restrictions}
                    </div>
                  </div>
                )}

                {task.allowed_tools && (
                  <div>
                    <h4 className="text-[14px] font-semibold text-foreground mb-2">Допустимые инструменты</h4>
                    <div className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">
                      {task.allowed_tools}
                    </div>
                  </div>
                )}
              </div>

              {/* Deadline */}
              {deadlineText && (
                <div className="p-4 rounded-[16px] bg-muted border border-border inline-flex items-center gap-2">
                  <Clock size={16} strokeWidth={1.5} className="text-muted-foreground" />
                  <span className="text-[14px] text-muted-foreground">
                    Срок выполнения: <span className="font-semibold text-foreground">{deadlineText}</span>
                  </span>
                </div>
              )}
            </div>

            {/* ── RIGHT: Workspace ── */}
            <div className="lg:sticky lg:top-[calc(64px+32px)] flex flex-col gap-6">
              {/* Status Card */}
              <div className="p-6 rounded-3xl bg-card border border-border">
                <h3 className="text-[14px] font-semibold text-foreground mb-4">
                  Моё участие
                </h3>

                <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
                  <span className="text-[14px] text-muted-foreground">Статус</span>
                  <SubmissionsStatusBadge
                    status={
                      mySubmission?.status === "approved"
                        ? "approved"
                        : mySubmission?.status === "rejected"
                          ? "rejected"
                          : mySubmission?.status === "pending"
                            ? "pending"
                            : task.status === "in_progress"
                              ? "in_progress"
                              : task.status
                    }
                  />
                </div>

                {renderRightColumn()}
              </div>

              {/* Participation info card */}
              <div className="p-6 rounded-3xl bg-card border border-border">
                <h4 className="text-[14px] font-semibold text-foreground mb-4">Об участии</h4>
                <div className="flex flex-col gap-3 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Заявка одобрена</span>
                    <span className="text-foreground font-medium">
                      {formatDate(participation.created_at) || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Статус заявки</span>
                    <span className="text-foreground font-medium">{participation.status}</span>
                  </div>
                </div>
              </div>

              {/* Link to full task page */}
              <Link
                href={`/tasks/${task.id}`}
                className="inline-flex items-center justify-center gap-2 h-[44px] text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors no-underline"
              >
                <ExternalLink size={16} />
                Открыть страницу задачи
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
