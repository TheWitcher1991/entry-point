"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitTaskResult } from "@entities/submission";
import { Check } from "@shared/ui/Icons";

interface SubmitFormProps {
  taskId: number;
}

export function SubmitForm({ taskId }: SubmitFormProps) {
  const [description, setDescription] = useState("");
  const [resultLinks, setResultLinks] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      submitTaskResult(taskId, {
        description: description.trim() || null,
        result_links: resultLinks.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task-submissions", taskId] });
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="border-t border-border pt-5">
        <div className="p-4 rounded-[16px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 text-[14px] font-medium text-emerald-700 dark:text-emerald-300 mb-1">
            <Check size={16} strokeWidth={3} />
            Результат отправлен на проверку
          </div>
          <p className="text-[13px] text-emerald-600/70 dark:text-emerald-400/70">
            Компания проверит ваш результат и даст обратную связь
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-5">
      <h4 className="text-[14px] font-semibold text-foreground mb-3">
        Сдать результат
      </h4>
      <div className="flex flex-col gap-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опишите, что сделано: ссылки на репозиторий, скриншоты, описание выполненной работы..."
          className="w-full h-[120px] px-4 py-3 rounded-[16px] bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
        />
        <input
          type="text"
          value={resultLinks}
          onChange={(e) => setResultLinks(e.target.value)}
          placeholder="Ссылки на результат (через запятую или по одной на строку)"
          className="w-full h-[44px] px-4 rounded-[16px] bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || (!description.trim() && !resultLinks.trim())}
          className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {mutation.isPending ? "Отправка..." : "Отправить на проверку"}
        </button>
        {mutation.isError && (
          <p className="text-[13px] text-destructive">Ошибка при отправке результата</p>
        )}
      </div>
    </div>
  );
}
