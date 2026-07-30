"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskSubmissions, reviewSubmission } from "@entities/submission";
import { SUBMISSION_STATUS_LABELS } from "@entities/submission";
import { ReviewForm } from "@features/review-form";
import { Check, X as XIcon, MessageSquare } from "@shared/ui/Icons";

interface ReviewSectionProps {
  taskId: number;
  skillNames?: string[];
}

export function ReviewSection({ taskId, skillNames }: ReviewSectionProps) {
  const [reviewComment, setReviewComment] = useState("");
  const [reviewingSubmissionId, setReviewingSubmissionId] = useState<
    number | null
  >(null);
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["task-submissions", taskId],
    queryFn: () => getTaskSubmissions(taskId),
  });

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

  if (isLoading) return null;
  if (submissions.length === 0) return null;

  const statusColors: Record<string, string> = {
    pending:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    approved:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  return (
    <div className="border-t border-border pt-5">
      <h4 className="text-[14px] font-semibold text-foreground mb-3">
        Результаты участников
      </h4>

      <div className="flex flex-col gap-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="p-4 rounded-[16px] bg-background border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[14px] font-medium text-foreground">
                  {sub.participant_first_name} {sub.participant_last_name}
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

            {/* Approved: leave a review */}
            {sub.status === "approved" &&
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
              reviewingSubmissionId === sub.id && (
                <ReviewForm
                  taskId={taskId}
                  submissionId={sub.id}
                  skillNames={skillNames}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
