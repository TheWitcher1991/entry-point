"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnit } from "effector-react";
import { useQuery } from "@tanstack/react-query";
import { $user } from "@features/auth";
import {
  getMyApplications,
  APPLICATION_STATUS_LABELS,
  type Application,
} from "@entities/application";
import { TASK_DIFFICULTY_LABELS } from "@entities/task";
import { getCompletedTasks, type CompletedTask } from "@entities/participant";
import { getMyReviews, type Review } from "@entities/review";
import { Header } from "@widgets/header";
import { Search, Clock, Layers, Award, Star, ChevronRight, UserPlus, Briefcase } from "@shared/ui/Icons";

export default function ParticipantDashboardPage() {
  const user = useUnit($user);
  const userName = user?.first_name || "Участник";
  const [activeTab, setActiveTab] = useState(0);

  const { data: applications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: getMyApplications,
  });

  const { data: completedTasks = [] } = useQuery({
    queryKey: ["my-completed-tasks"],
    queryFn: getCompletedTasks,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: getMyReviews,
  });

  const reviewBySubmission = new Map<number, Review>();
  for (const rev of reviews) {
    reviewBySubmission.set(rev.submission_id, rev);
  }

  const inProgressApps = applications.filter((a) => a.status === "approved");
  const completedCount = completedTasks.length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  const renderApplications = () => {
    if (applications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-muted flex items-center justify-center mb-4">
            <UserPlus size={24} className="text-muted-foreground" />
          </div>
          <p className="text-[15px] text-muted-foreground mb-4">У вас пока нет заявок</p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
          >
            <Layers size={16} />
            Найти задачи
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {applications.map((app: Application) => (
          <Link
            key={app.id}
            href={`/tasks/${app.task_id}`}
            className="p-4 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline active:scale-[0.96] block"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                {app.task_title?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className="font-semibold text-[15px] text-foreground truncate">{app.task_title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium shrink-0 ${
                    app.status === "pending" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" :
                    app.status === "approved" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                    app.status === "rejected" ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                    app.status === "withdrawn" ? "bg-muted text-muted-foreground" :
                    "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
                  }`}>
                    {APPLICATION_STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                  <span>Подана: {new Date(app.created_at).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderCompleted = () => {
    if (completedTasks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-[15px] text-muted-foreground">Пока нет завершённых задач</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {completedTasks.map((exp: CompletedTask) => (
          <div key={exp.submission_id} className="p-5 rounded-3xl bg-card border border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Link
                  href={`/tasks/${exp.task_id}`}
                  className="font-semibold text-[15px] text-foreground hover:text-primary transition-colors no-underline"
                >
                  {exp.task_title}
                </Link>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  {exp.company_name && `${exp.company_name} · `}
                  {new Date(exp.completed_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-[12px] font-medium shrink-0">
                Завершено
              </span>
            </div>

            {exp.description && (
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                {exp.description}
              </p>
            )}

            {(() => {
              const review = reviewBySubmission.get(exp.submission_id);
              if (review) {
                return (
                  <div className="p-3 rounded-[10px] bg-muted mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "#f59e0b" : "none"}
                          stroke={star <= review.rating ? "#f59e0b" : "currentColor"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                      <span className="text-[13px] font-medium text-foreground ml-1">
                        {review.rating}/5
                      </span>
                    </div>
                    {review.text && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-1.5">
                        {review.text}
                      </p>
                    )}
                    {review.skills_confirmed && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {review.skills_confirmed.split(",").map((skill) => (
                          <span
                            key={skill.trim()}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (exp.review_comment) {
                return (
                  <div className="p-3 rounded-[10px] bg-muted text-[13px] text-muted-foreground mb-3">
                    <span className="font-medium text-foreground">Отзыв компании: </span>
                    {exp.review_comment}
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex items-center gap-1">
              <Award size={14} className="text-primary" />
              <span className="text-[13px] text-muted-foreground ml-1">
                {exp.task_difficulty
                  ? (TASK_DIFFICULTY_LABELS[exp.task_difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || exp.task_difficulty)
                  : "Опыт"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderInProgress = () => {
    if (inProgressApps.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-[16px] bg-muted flex items-center justify-center mb-4">
            <Briefcase size={24} className="text-muted-foreground" />
          </div>
          <p className="text-[15px] text-muted-foreground">Нет задач в работе</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {inProgressApps.map((app: Application) => (
          <Link
            key={app.id}
            href={`/participant/tasks/${app.task_id}`}
            className="p-5 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline active:scale-[0.96] block"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                {app.task_title?.[0] || "?"}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h4 className="font-semibold text-[15px] text-foreground">{app.task_title}</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium shrink-0">
                    В работе
                  </span>
                </div>
                <div className="text-[13px] text-muted-foreground">
                  Заявка одобрена · {new Date(app.updated_at).toLocaleDateString("ru-RU")}
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const tabContent = [renderApplications, renderInProgress, renderCompleted];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold font-display text-foreground">Обзор</h1>
            <p className="text-[15px] text-muted-foreground mt-1">
              Добро пожаловать, {userName}
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-opacity no-underline"
          >
            <Search size={16} />
            Найти задачу
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: String(pendingCount), label: "Активные заявки", icon: Layers },
            { value: String(inProgressApps.length), label: "В работе", icon: Clock },
            { value: String(completedCount), label: "Завершено", icon: Award },
            { value: String(completedCount > 0 ? "★" : "—"), label: "Опыт", icon: Star },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-3xl bg-card border border-border text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-[28px] font-bold font-display text-primary">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {[
            { label: "Мои заявки", count: applications.length },
            { label: "В работе", count: inProgressApps.length },
            { label: "Завершённые", count: completedCount },
          ].map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-[14px] font-medium -mb-px border-b-2 bg-transparent cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === i
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                activeTab === i
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-10">
          {tabContent[activeTab]()}
        </div>
      </div>
    </div>
  );
}
