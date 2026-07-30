"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  getCompanyApplications,
  updateApplicationStatus,
  APPLICATION_STATUS_LABELS,
} from "@entities/application";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, ExternalLink, Check, X as XIcon } from "@shared/ui/Icons";
import type { ApplicationStatus } from "@entities/application";

export function ApplicationReviewList() {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["company-applications"],
    queryFn: getCompanyApplications,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      updateApplicationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-applications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-[10px]" />
              <Skeleton className="h-9 w-24 rounded-[10px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-16">
        <Briefcase size={40} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-[18px] font-semibold text-foreground mb-2">Нет заявок</h3>
        <p className="text-[14px] text-muted-foreground max-w-sm mx-auto">
          Заявки на ваши задачи появятся здесь после публикации
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    review: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
    approved: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    withdrawn: "bg-muted text-muted-foreground",
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      {pendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-[13px] text-amber-700 dark:text-amber-300 font-medium">
            {pendingCount} {pendingCount === 1 ? "заявка ожидает" : pendingCount < 5 ? "заявки ожидают" : "заявок ожидают"} рассмотрения
          </p>
        </div>
      )}

      {applications.map((app) => (
        <div key={app.id} className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarFallback className="text-base">
                    {app.participant_first_name?.[0] || app.participant_last_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold text-foreground">
                    {app.participant_first_name} {app.participant_last_name}
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
                    Задача: {app.task_title}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium shrink-0 ${
                  statusColors[app.status] || "bg-muted text-muted-foreground"
                }`}
              >
                {APPLICATION_STATUS_LABELS[app.status] || app.status}
              </span>
            </div>

            {app.cover_letter && (
              <div className="mb-4 ml-[60px]">
                <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-line">
                  {app.cover_letter}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 ml-[60px]">
              <span className="text-[12px] text-muted-foreground">
                {new Date(app.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <Link
                href={`/company/tasks/${app.task_id}`}
                className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline no-underline"
              >
                <ExternalLink size={12} />
                Задача
              </Link>
            </div>

            {app.status === "pending" && (
              <div className="flex gap-2 mt-4 ml-[60px] pt-4 border-t border-border">
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: app.id, status: "approved" })
                  }
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:opacity-90 rounded-[10px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                  Одобрить
                </button>
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: app.id, status: "rejected" })
                  }
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-[10px] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <XIcon size={14} />
                  Отклонить
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
