"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanyApplications,
  updateApplicationStatus,
  APPLICATION_STATUS_LABELS,
} from "@entities/application";
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
      <div className="text-[15px] text-muted-foreground">Загрузка заявок...</div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[15px] text-muted-foreground">
          Пока нет заявок на ваши задачи
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    review:
      "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
    approved:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    withdrawn: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col gap-4">
      {applications.map((app) => (
        <div key={app.id} className="p-6 rounded-3xl bg-card border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-foreground">
                {app.participant_first_name} {app.participant_last_name}
              </h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Задача: {app.task_title}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                statusColors[app.status] || "bg-muted text-muted-foreground"
              }`}
            >
              {APPLICATION_STATUS_LABELS[app.status] || app.status}
            </span>
          </div>

          {app.cover_letter && (
            <p className="text-[14px] text-foreground leading-relaxed mb-4 whitespace-pre-line">
              {app.cover_letter}
            </p>
          )}

          <div className="text-[13px] text-muted-foreground mb-4">
            Подана:{" "}
            {new Date(app.created_at).toLocaleDateString("ru-RU")}
          </div>

          {app.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  statusMutation.mutate({ id: app.id, status: "approved" })
                }
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:opacity-90 rounded-[10px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50"
              >
                Одобрить
              </button>
              <button
                onClick={() =>
                  statusMutation.mutate({ id: app.id, status: "rejected" })
                }
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-[10px] transition-colors cursor-pointer disabled:opacity-50"
              >
                Отклонить
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
