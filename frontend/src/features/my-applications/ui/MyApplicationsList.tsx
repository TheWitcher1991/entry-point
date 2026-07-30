"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyApplications,
  updateApplicationStatus,
  APPLICATION_STATUS_LABELS,
} from "@entities/application";

export function MyApplicationsList() {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: number) =>
      updateApplicationStatus(id, { status: "withdrawn" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[15px] text-muted-foreground mb-4">
          Вы ещё не подали заявки
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-white bg-primary rounded-[12px] hover:opacity-90 transition-opacity no-underline"
        >
          Найти задачи
        </Link>
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
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link
                href={`/tasks/${app.task_id}`}
                className="text-[16px] font-semibold text-foreground hover:text-primary transition-colors no-underline"
              >
                {app.task_title}
              </Link>
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
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3 whitespace-pre-line line-clamp-2">
              {app.cover_letter}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">
              Подана:{" "}
              {new Date(app.created_at).toLocaleDateString("ru-RU")}
            </span>

            {app.status === "pending" && (
              <button
                onClick={() => withdrawMutation.mutate(app.id)}
                disabled={withdrawMutation.isPending}
                className="text-[13px] font-medium text-muted-foreground hover:text-destructive transition-colors bg-transparent cursor-pointer"
              >
                Отозвать
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
