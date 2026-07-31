import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, updateReview } from "@entities/review";
import type { Review } from "@entities/review";
import { Check, X as XIcon } from "@shared/ui/Icons";

interface ReviewFormProps {
  taskId: number;
  submissionId: number;
  skillNames?: string[];
  /** When provided, the form edits this review instead of creating one. */
  review?: Review;
  onCancel?: () => void;
}

function StarIcon({ filled, size = 22 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "#F59E0B" : "none"}
      stroke={filled ? "#F59E0B" : "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function ReviewForm({
  taskId,
  submissionId,
  skillNames,
  review,
  onCancel,
}: ReviewFormProps) {
  const isEditing = !!review;
  const initialSkills = review?.skills_confirmed
    ? review.skills_confirmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const [rating, setRating] = useState(review?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState(review?.text ?? "");
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>(initialSkills);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: () => {
      const payload = {
        rating,
        text: text.trim() || null,
        skills_confirmed:
          confirmedSkills.length > 0 ? confirmedSkills.join(", ") : null,
      };
      return isEditing && review
        ? updateReview(taskId, review.id, payload)
        : createReview(taskId, submissionId, payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-reviews", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["company-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["participant-reviews"] });
    },
  });

  if (submitted) {
    return (
      <div className="p-4 rounded-[16px] bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[14px] font-medium">
          <Check size={16} strokeWidth={3} />
          {isEditing ? "Отзыв обновлён!" : "Отзыв оставлен! Спасибо."}
        </div>
        {isEditing && onCancel && (
          <button
            onClick={onCancel}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[8px] transition-colors cursor-pointer"
          >
            <XIcon size={12} />
            Закрыть
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h5 className="text-[14px] font-semibold text-foreground">
          {isEditing ? "Редактировать отзыв" : "Оставить отзыв участнику"}
        </h5>
        {isEditing && onCancel && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[8px] transition-colors cursor-pointer"
          >
            <XIcon size={12} />
            Отмена
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div>
        <label className="text-[13px] text-muted-foreground mb-1.5 block">
          Оценка
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="bg-transparent cursor-pointer p-0.5 transition-[scale] duration-100 ease-out active:scale-[0.9]"
            >
              <StarIcon
                filled={star <= (hoveredRating || rating)}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="text-[13px] text-muted-foreground mb-1.5 block">
          Текст отзыва
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Расскажите о сотрудничестве: что получилось хорошо, что можно улучшить..."
          className="w-full h-[80px] px-3 py-2 rounded-[12px] bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Confirmed Skills */}
      {skillNames && skillNames.length > 0 && (
        <div>
          <label className="text-[13px] text-muted-foreground mb-1.5 block">
            Подтвердить навыки
          </label>
          <div className="flex flex-wrap gap-2">
            {skillNames.map((skill) => {
              const isSelected = confirmedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    setConfirmedSkills((prev) =>
                      prev.includes(skill)
                        ? prev.filter((s) => s !== skill)
                        : [...prev, skill],
                    )
                  }
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-[12px] font-medium border transition-[scale,background-color,border-color] duration-150 ease-out cursor-pointer active:scale-[0.96] ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={() => reviewMutation.mutate()}
        disabled={rating === 0 || reviewMutation.isPending}
        className="w-full h-[40px] inline-flex items-center justify-center gap-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {reviewMutation.isPending
          ? "Сохранение..."
          : isEditing
            ? "Сохранить изменения"
            : "Отправить отзыв"}
      </button>

      {reviewMutation.isError && (
        <p className="text-[12px] text-destructive">
          {isEditing
            ? "Не удалось обновить отзыв. Попробуйте снова."
            : "Не удалось отправить отзыв. Попробуйте снова."}
        </p>
      )}
    </div>
  );
}
