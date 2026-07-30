"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication } from "@entities/application";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";

interface ApplyButtonProps {
  taskId: number;
}

export function ApplyButton({ taskId }: ApplyButtonProps) {
  const user = useUnit($user);
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createApplication({
        task_id: taskId,
        cover_letter: coverLetter.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setShowForm(false);
      setCoverLetter("");
    },
  });

  if (user?.role !== "participant") return null;

  if (mutation.isSuccess) {
    return (
      <div className="border-t border-border pt-5">
        <div className="p-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-[14px] text-emerald-700 dark:text-emerald-300 text-center">
          Заявка отправлена!
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="border-t border-border pt-5 flex flex-col gap-3">
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Расскажите, почему вы хотите выполнить эту задачу и почему компания должна выбрать именно вас..."
          className="w-full h-[100px] px-4 py-3 rounded-[16px] bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? "Отправка..." : "Отправить заявку"}
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="h-[44px] px-4 text-[14px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors cursor-pointer"
          >
            Отмена
          </button>
        </div>
        {mutation.isError && (
          <p className="text-[13px] text-destructive">Ошибка при отправке заявки</p>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-5">
      <button
        onClick={() => setShowForm(true)}
        className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer"
      >
        Подать заявку
      </button>
    </div>
  );
}
