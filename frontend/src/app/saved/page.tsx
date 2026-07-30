"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSavedTasks, TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS, type TaskListItem } from "@entities/task";
import { Header } from "@widgets/header";
import { Bookmark, ChevronRight, Clock, Layers } from "@shared/ui/Icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedTasksPage() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["saved-tasks"],
    queryFn: getSavedTasks,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold font-display text-foreground">Сохранённые задачи</h1>
          <p className="text-[15px] text-muted-foreground mt-1">
            {tasks && tasks.length > 0
              ? `${tasks.length} ${tasks.length === 1 ? "задача" : "задачи"} в сохранённых`
              : "Здесь появятся задачи, которые вы сохранили"}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-3xl bg-card border border-border">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-[12px]" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && tasks && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
              <Bookmark size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-[18px] font-bold font-display text-foreground mb-2">Нет сохранённых задач</h3>
            <p className="text-[14px] text-muted-foreground mb-6 max-w-sm">
              Нажимайте на иконку закладки у задачи, чтобы сохранить её и вернуться к ней позже.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-opacity no-underline"
            >
              <Layers size={16} />
              Перейти в каталог
            </Link>
          </div>
        )}

        {/* Task List */}
        {!isLoading && tasks && tasks.length > 0 && (
          <div className="grid gap-4">
            {tasks.map((task: TaskListItem) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="p-5 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline active:scale-[0.96] block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                    {task.title?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="font-semibold text-[15px] text-foreground truncate">{task.title}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium shrink-0 whitespace-nowrap">
                        {TASK_STATUS_LABELS[task.status] || task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                      <span>{task.company_name || "Компания"}</span>
                      {task.difficulty && (
                        <>
                          <span>·</span>
                          <span>{TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty}</span>
                        </>
                      )}
                      {task.deadline && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            до {new Date(task.deadline).toLocaleDateString("ru-RU")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
