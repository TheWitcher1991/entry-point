"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskSubmissions, reviewSubmission, approveParticipantWithoutResult } from "@entities/submission";
import { SUBMISSION_STATUS_LABELS } from "@entities/submission";
import type { TaskParticipant } from "@entities/task";
import { getTaskReviews, deleteReview } from "@entities/review";
import { ReviewForm } from "@features/review-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Check, X as XIcon, MessageSquare, Star, FileText, Edit, Delete, UserPlus } from "@shared/ui/Icons";

interface ReviewSectionProps {
  taskId: number;
  skillNames?: string[];
  contained?: boolean;
  /** When provided, render a card per task participant (including those
   *  without a submission yet) instead of only submissions. */
  participants?: TaskParticipant[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          strokeWidth={star <= rating ? 0 : 1.5}
          className={star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}
        />
      ))}
    </span>
  );
}

export function ReviewSection({ taskId, skillNames, contained, participants }: ReviewSectionProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState<
    number | null
  >(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["task-submissions", taskId],
    queryFn: () => getTaskSubmissions(taskId),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["task-reviews", taskId],
    queryFn: () => getTaskReviews(taskId),
    enabled: !isLoading,
  });

  const reviewBySubmission = new Map(
    reviews.map((review) => [review.submission_id, review]),
  );

  const reviewMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
    }: {
      submissionId: number;
      status: "approved" | "rejected";
    }) =>
      reviewSubmission(taskId, submissionId, {
        status,
        review_comment: reviewComment.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      setReviewComment("");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(taskId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-reviews", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["company-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["participant-reviews"] });
    },
  });

  const approveNoResultMutation = useMutation({
    mutationFn: (participantId: number) =>
      approveParticipantWithoutResult(taskId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-participants", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  if (isLoading) return null;
  if (submissions.length === 0 && (!participants || participants.length === 0)) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    approved:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  const submissionByParticipant = new Map(
    submissions.map((sub) => [sub.participant_id, sub]),
  );

  interface Row {
    participant_id: number;
    name: string;
    submission?: (typeof submissions)[number];
  }

  const rows: Row[] = participants?.length
    ? participants.map((p) => ({
        participant_id: p.participant_id,
        name: `${p.participant_first_name || ""} ${p.participant_last_name || ""}`.trim() || "Участник",
        submission: submissionByParticipant.get(p.participant_id),
      }))
    : submissions.map((sub) => ({
        participant_id: sub.participant_id,
        name: `${sub.participant_first_name || ""} ${sub.participant_last_name || ""}`.trim() || "Участник",
        submission: sub,
      }));

  return (
    <div className={contained ? "" : "border-t border-border pt-5"}>
      <h4 className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
        Результаты участников
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">
            {pendingCount}
          </span>
        )}
      </h4>

      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const sub = row.submission;
          if (!sub) {
            return (
              <div
                key={`no-sub-${row.participant_id}`}
                className="p-4 rounded-[16px] bg-background border border-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-foreground">
                    {row.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <FileText size={14} strokeWidth={1.5} />
                    Результат не отправлен
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border">
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    Можно принять и оставить отзыв, даже если участник не
                    прикрепил результат
                  </p>
                  <button
                    onClick={() =>
                      approveNoResultMutation.mutate(row.participant_id)
                    }
                    disabled={approveNoResultMutation.isPending}
                    className="inline-flex items-center gap-1.5 h-[32px] px-3 text-[12px] font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-[8px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <UserPlus size={13} />
                    Принять без результата
                  </button>
                </div>
              </div>
            );
          }

          const review = reviewBySubmission.get(sub.id);
          return (
            <div
              key={sub.id}
              className="p-4 rounded-[16px] bg-background border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[14px] font-medium text-foreground">
                    {row.name}
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      statusColors[sub.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {SUBMISSION_STATUS_LABELS[
                      sub.status as keyof typeof SUBMISSION_STATUS_LABELS
                    ] || sub.status}
                  </span>
                </div>
                <span className="text-[12px] text-muted-foreground">
                  {new Date(sub.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {sub.description && (
                <p className="text-[14px] text-foreground leading-relaxed mb-2 whitespace-pre-line">
                  {sub.description}
                </p>
              )}

              {sub.result_links && (
                <p className="text-[13px] text-muted-foreground mb-3 whitespace-pre-line">
                  {sub.result_links}
                </p>
              )}

              {sub.review_comment && sub.status === "rejected" && (
                <div className="p-3 rounded-[10px] bg-red-50 dark:bg-red-900/20 text-[13px] text-red-600 dark:text-red-400 mb-3">
                  <span className="font-medium">Комментарий: </span>
                  {sub.review_comment}
                </div>
              )}

              {/* Pending: approve/reject */}
              {sub.status === "pending" && (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Комментарий к решению (будет виден участнику)"
                    className="w-full h-[60px] px-3 py-2 rounded-[12px] bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          submissionId: sub.id,
                          status: "approved",
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="min-w-0 flex-1 h-[36px] inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-white bg-emerald-600 hover:opacity-90 rounded-[10px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={3} />
                      Принять
                    </button>
                    <button
                      onClick={() =>
                        reviewMutation.mutate({
                          submissionId: sub.id,
                          status: "rejected",
                        })
                      }
                      disabled={reviewMutation.isPending}
                      className="min-w-0 flex-1 h-[36px] inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-[10px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      <XIcon size={14} />
                      На доработку
                    </button>
                  </div>
                </div>
              )}

              {/* Approved with existing review */}
              {sub.status === "approved" && review && editingReviewId !== review.id && (
                <div className="p-3 rounded-[10px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={review.rating} />
                    <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
                      Отзыв оставлен
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-auto">
                      {new Date(review.created_at).toLocaleDateString("ru-RU")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingReviewId(review.id)}
                        title="Редактировать отзыв"
                        className="inline-flex items-center justify-center w-7 h-7 text-muted-foreground bg-transparent border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-[8px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] cursor-pointer"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteReviewTarget({
                            id: review.id,
                            name: row.name,
                          })
                        }
                        disabled={deleteReviewMutation.isPending}
                        title="Удалить отзыв"
                        className="inline-flex items-center justify-center w-7 h-7 text-red-500 bg-transparent border border-emerald-200 dark:border-emerald-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-[8px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
                      >
                        <Delete size={13} />
                      </button>
                    </div>
                  </div>
                  {review.text && (
                    <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">
                      {review.text}
                    </p>
                  )}
                  {review.skills_confirmed && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {review.skills_confirmed.split(", ").map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium"
                        >
                          <Check size={10} strokeWidth={3} className="mr-1" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Approved: editing the existing review */}
              {sub.status === "approved" &&
                review &&
                editingReviewId === review.id && (
                  <ReviewForm
                    taskId={taskId}
                    submissionId={sub.id}
                    skillNames={skillNames}
                    review={review}
                    onCancel={() => setEditingReviewId(null)}
                  />
                )}

              {/* Approved, no review yet: leave a review */}
              {sub.status === "approved" &&
                !review &&
                reviewingSubmissionId !== sub.id && (
                  <button
                    onClick={() => setReviewingSubmissionId(sub.id)}
                    className="inline-flex items-center gap-1.5 h-[36px] px-4 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[10px] transition-colors cursor-pointer active:scale-[0.96]"
                  >
                    <MessageSquare size={14} />
                    Оставить отзыв
                  </button>
                )}

              {sub.status === "approved" &&
                !review &&
                reviewingSubmissionId === sub.id && (
                  <ReviewForm
                    taskId={taskId}
                    submissionId={sub.id}
                    skillNames={skillNames}
                  />
                )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteReviewTarget}
        onOpenChange={(open) => !open && setDeleteReviewTarget(null)}
        title="Удалить отзыв?"
        description="Отзыв будет удалён, подтверждённый опыт участника будет снят. Действие необратимо."
        confirmLabel="Удалить"
        onConfirm={() => {
          if (deleteReviewTarget) {
            deleteReviewMutation.mutate(deleteReviewTarget.id);
            setDeleteReviewTarget(null);
          }
        }}
      />
    </div>
  );
}
