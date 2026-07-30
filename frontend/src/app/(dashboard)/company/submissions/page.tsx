"use client";

import { useState } from "react";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getMyCompanyTasks } from "@entities/task";
import { getTaskSubmissions, reviewSubmission, SUBMISSION_STATUS_LABELS } from "@entities/submission";
import { Header } from "@widgets/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X as XIcon, ArrowLeft, Layers, Eye } from "@shared/ui/Icons";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export default function CompanySubmissionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<Record<number, string>>({});

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["company-tasks"],
    queryFn: getMyCompanyTasks,
    staleTime: 10_000,
  });

  // Tasks that can have submissions (ones with participants working)
  const activeTasks = tasks.filter(
    (t) => ["selected", "in_progress", "review", "rework"].includes(t.status) && t.participant_count > 0,
  );

  // Fetch submissions for each active task
  const submissionsQueries = useQueries({
    queries: activeTasks.map((task) => ({
      queryKey: ["task-submissions", task.id],
      queryFn: () => getTaskSubmissions(task.id),
      staleTime: 10_000,
    })),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      taskId,
      submissionId,
      status,
      comment,
    }: {
      taskId: number;
      submissionId: number;
      status: "approved" | "rejected";
      comment: string | null;
    }) =>
      reviewSubmission(taskId, submissionId, {
        status,
        review_comment: comment,
      }),
    onSuccess: () => {
      // Invalidate all task-submissions queries
      activeTasks.forEach((task) => {
        queryClient.invalidateQueries({ queryKey: ["task-submissions", task.id] });
      });
      queryClient.invalidateQueries({ queryKey: ["company-tasks"] });
    },
  });

  // Build flat list of submissions with task info
  const submissionsWithTask = activeTasks.flatMap((task, idx) => {
    const subs = submissionsQueries[idx]?.data ?? [];
    return subs.map((sub) => ({ ...sub, taskTitle: task.title, taskId: task.id }));
  });

  const pendingSubmissions = submissionsWithTask.filter((s) => s.status === "pending");
  const otherSubmissions = submissionsWithTask.filter((s) => s.status !== "pending");

  const totalPending = pendingSubmissions.length;
  const totalSubmissions = submissionsWithTask.length;

  const isLoading = tasksLoading || submissionsQueries.some((q) => q.isLoading);

  const setComment = (submissionId: number, value: string) => {
    setComments((prev) => ({ ...prev, [submissionId]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-10 pb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} />
          Назад
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold font-display text-foreground">
              Результаты
            </h1>
            <p className="text-[15px] text-muted-foreground mt-1">
              {totalPending > 0
                ? `${totalPending} на проверке · ${totalSubmissions} всего`
                : totalSubmissions > 0
                  ? `${totalSubmissions} результатов`
                  : "Результаты появятся, когда участники отправят работу"}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <Link
            href="/company/tasks"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Мои задачи
          </Link>
          <Link
            href="/company/applications"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Заявки
          </Link>
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary flex items-center gap-2">
            Результаты
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-card border border-border">
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-9 w-32 rounded-[10px]" />
              </div>
            ))}
          </div>
        ) : totalSubmissions === 0 ? (
          <div className="text-center py-20">
            <Layers size={40} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-[18px] font-semibold text-foreground mb-2">
              Нет результатов
            </h3>
            <p className="text-[14px] text-muted-foreground mb-6 max-w-sm mx-auto">
              Когда участники отправят результаты, они появятся здесь — можно будет проверить, принять или отправить на доработку.
            </p>
            <Link
              href="/company/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors no-underline"
            >
              <Eye size={16} />
              К задачам
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Pending - needs review */}
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-3xl bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-foreground">
                        {sub.participant_first_name} {sub.participant_last_name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        {SUBMISSION_STATUS_LABELS.pending}
                      </span>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                      Задача:{" "}
                      <Link
                        href={`/tasks/${sub.taskId}`}
                        className="text-primary hover:underline"
                      >
                        {sub.taskTitle}
                      </Link>
                    </p>
                  </div>
                  <span className="text-[12px] text-muted-foreground shrink-0 ml-4">
                    {new Date(sub.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>

                {sub.description && (
                  <p className="text-[14px] text-foreground leading-relaxed mb-3 whitespace-pre-line">
                    {sub.description}
                  </p>
                )}

                {sub.result_links && (
                  <p className="text-[13px] text-muted-foreground mb-3 whitespace-pre-line">
                    {sub.result_links}
                  </p>
                )}

                {/* Approve / Rework */}
                <div className="flex flex-col gap-3 mt-3">
                  <textarea
                    value={comments[sub.id] ?? ""}
                    onChange={(e) => setComment(sub.id, e.target.value)}
                    placeholder="Комментарий к решению (будет виден участнику)"
                    className="w-full h-[60px] px-3 py-2 rounded-[12px] bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          taskId: sub.taskId,
                          submissionId: sub.id,
                          status: "approved",
                          comment: (comments[sub.id] ?? "").trim() || null,
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="flex-1 h-[36px] inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-white bg-emerald-600 hover:opacity-90 rounded-[10px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={3} />
                      Принять
                    </button>
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          taskId: sub.taskId,
                          submissionId: sub.id,
                          status: "rejected",
                          comment: (comments[sub.id] ?? "").trim() || null,
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="flex-1 h-[36px] inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-[10px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XIcon size={14} />
                      Отправить на доработку
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Other (approved/rejected) - collapsible or just listed */}
            {otherSubmissions.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[13px] text-muted-foreground font-medium px-3">
                    Проверенные ({otherSubmissions.length})
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {otherSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-6 rounded-3xl bg-card border border-border opacity-70"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[15px] font-semibold text-foreground">
                            {sub.participant_first_name} {sub.participant_last_name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              statusColors[sub.status] || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {SUBMISSION_STATUS_LABELS[sub.status as keyof typeof SUBMISSION_STATUS_LABELS] || sub.status}
                          </span>
                        </div>
                        <p className="text-[13px] text-muted-foreground">
                          Задача:{" "}
                          <Link
                            href={`/tasks/${sub.taskId}`}
                            className="text-primary hover:underline"
                          >
                            {sub.taskTitle}
                          </Link>
                        </p>
                      </div>
                      <span className="text-[12px] text-muted-foreground shrink-0 ml-4">
                        {new Date(sub.created_at).toLocaleDateString("ru-RU")}
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line">
                        {sub.description}
                      </p>
                    )}

                    {sub.review_comment && (
                      <div className="mt-3 p-3 rounded-[10px] bg-muted text-[13px] text-muted-foreground">
                        <span className="font-medium text-foreground">Комментарий: </span>
                        {sub.review_comment}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
