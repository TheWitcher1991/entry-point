"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication, getMyApplications } from "@entities/application";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

interface ApplyButtonProps {
  taskId: number;
}

export function ApplyButton({ taskId }: ApplyButtonProps) {
  const user = useUnit($user);
  const [showForm, setShowForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const queryClient = useQueryClient();

  // Check if user already has an application for this task
  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
    enabled: !!user,
  });

  const existingApplication = myApplications.find((a) => a.task_id === taskId);

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

  // Company users don't see the button at all
  if (user?.role === "company") return null;

  // Already applied — show status
  if (existingApplication) {
    return (
      <div className="border-t border-border pt-5">
        <div className="p-3 rounded-[12px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-[14px] text-emerald-700 dark:text-emerald-300 text-center">
          Заявка отправлена
        </div>
      </div>
    );
  }

  // Just submitted (optimistic fallback)
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
    <>
      <div className="border-t border-border pt-5">
        <button
          onClick={handleClick}
          className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer"
        >
          Подать заявку
        </button>
      </div>

      {/* Login prompt modal for unauthorized users */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="p-6 sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-[16px] bg-primary/10 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <DialogTitle className="text-[18px] font-bold font-display">
              Войдите в аккаунт
            </DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">
              Чтобы откликнуться на задачу, войдите в профиль участника или зарегистрируйтесь.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
              onClick={() => setShowLoginModal(false)}
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors no-underline"
              onClick={() => setShowLoginModal(false)}
            >
              Зарегистрироваться
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  function handleClick() {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowForm(true);
    }
  }
}
