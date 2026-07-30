"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { getProfile, getCompletedTasks, type CompletedTask } from "@entities/participant";
import { getMyReviews, type Review } from "@entities/review";
import { TASK_DIFFICULTY_LABELS } from "@entities/task";
import { Header } from "@widgets/header";
import { ParticipantProfileForm } from "@features/participant-profile";
import { Award, Star, ChevronRight, MapPin, Briefcase, User, Clock, Layers, CheckVerified, Settings, ExternalLink } from "@shared/ui/Icons";
import { Skeleton } from "@/components/ui/skeleton";

const availabilityLabels: Record<string, string> = {
  active: "Активно ищу",
  passive: "Рассматриваю предложения",
  not_looking: "Не ищу",
};

export default function ParticipantProfilePage() {
  const user = useUnit($user);
  const [showEdit, setShowEdit] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: getProfile,
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

  const getInitials = () => {
    if (profile?.first_name) return profile.first_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "?";
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
    if (profile?.first_name) return profile.first_name;
    return user?.email || "Участник";
  };

  // Collect unique confirmed skills from all reviews
  const allConfirmedSkills = new Set<string>();
  for (const rev of reviews) {
    if (rev.skills_confirmed) {
      rev.skills_confirmed.split(",").map(s => s.trim()).forEach(s => allConfirmedSkills.add(s));
    }
  }

  const totalReviews = reviews.length;
  const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : "—";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* ── Hero Section ── */}
        {profileLoading ? (
          <div className="flex items-center gap-6 mb-10">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[28px] font-bold shrink-0">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-[28px] font-bold font-display text-foreground">{getFullName()}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[14px] text-muted-foreground">
                  {profile?.desired_role && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} />
                      {profile.desired_role}
                    </span>
                  )}
                  {profile?.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {profile.city}
                    </span>
                  )}
                  {profile?.availability_status && availabilityLabels[profile.availability_status] && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {availabilityLabels[profile.availability_status]}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-foreground bg-muted hover:bg-muted/80 rounded-[14px] transition-[scale,background-color] active:scale-[0.96] cursor-pointer shrink-0"
            >
              <Settings size={15} />
              {showEdit ? "Свернуть" : "Редактировать"}
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { value: String(completedTasks.length), label: "Завершено задач", icon: Award },
            { value: String(totalReviews), label: "Отзывов", icon: Star },
            { value: avgRating, label: "Средний рейтинг", icon: Star },
            { value: String(allConfirmedSkills.size), label: "Подтверждено навыков", icon: CheckVerified },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-3xl bg-card border border-border text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" />
                <div className="text-[28px] font-bold font-display text-primary">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── Achievements: Completed Tasks with Reviews ── */}
        {completedTasks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[20px] font-bold font-display text-foreground mb-5">Достижения и результаты</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTasks.map((exp: CompletedTask) => {
                const review = reviewBySubmission.get(exp.submission_id);
                return (
                  <Link
                    key={exp.submission_id}
                    href={`/tasks/${exp.task_id}`}
                    className="p-5 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline active:scale-[0.96] block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[15px] text-foreground">{exp.task_title}</h4>
                        <div className="text-[13px] text-muted-foreground mt-0.5">
                          {exp.company_name && `${exp.company_name}`}
                          {exp.task_difficulty && ` · ${TASK_DIFFICULTY_LABELS[exp.task_difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || exp.task_difficulty}`}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[12px] font-medium shrink-0 whitespace-nowrap">
                        <Award size={12} />
                        Завершено
                      </span>
                    </div>

                    {review ? (
                      <div className="p-3 rounded-[12px] bg-muted">
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill={star <= review.rating ? "#f59e0b" : "none"}
                              stroke={star <= review.rating ? "#f59e0b" : "currentColor"}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0 text-muted-foreground"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                          <span className="text-[13px] font-medium text-foreground ml-1">{review.rating}/5</span>
                        </div>
                        {review.text && (
                          <p className="text-[13px] text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
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
                                <CheckVerified size={11} className="mr-1" />
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                        {exp.description || "Задача выполнена"}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {completedTasks.length === 0 && !profileLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center mb-10">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
              <Award size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-[18px] font-bold font-display text-foreground mb-2">Пока нет достижений</h3>
            <p className="text-[14px] text-muted-foreground mb-6 max-w-sm">
              Выполняйте задачи и получайте отзывы — они появятся здесь.
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

        {/* ── Edit Form (collapsible) ── */}
        {showEdit && (
          <div className="rounded-[24px] bg-card border border-border p-6 sm:p-8 mb-8">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-6">Редактировать профиль</h2>
            <ParticipantProfileForm />
          </div>
        )}
      </div>
    </div>
  );
}
