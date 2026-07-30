"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCompanyById } from "@entities/company";
import { getTasks, TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS } from "@entities/task";
import type { TaskListItem } from "@entities/task";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  ChevronRight,
  ExternalLink,
  Grid,
  MapPin,
  Building,
  Clock,
  CheckVerified,
  Layers,
  Briefcase,
  Users,
} from "@shared/ui/Icons";

const LIGHT_BG_COLORS = [
  "bg-[#E8F4F4] text-primary",
  "bg-[#FFF3E0] text-[#E65100]",
  "bg-[#E3F2FD] text-[#0D47A1]",
  "bg-[#F3E5F5] text-[#4A148C]",
  "bg-[#E8F5E9] text-[#1B5E20]",
  "bg-[#FBE9E7] text-[#BF360C]",
  "bg-[#FCE4EC] text-[#880E4F]",
  "bg-[#E0F7FA] text-[#00695C]",
];

function getCompanyColor(id: number): string {
  return LIGHT_BG_COLORS[id % LIGHT_BG_COLORS.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= rating ? "#F59E0B" : "none"}
          stroke={star <= rating ? "#F59E0B" : "currentColor"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const MOCK_REVIEWS = [
  {
    initials: "АП",
    name: "Алексей Петров",
    role: "Backend-разработчик",
    rating: 5,
    avatarBg: "bg-[#E8F4F4] text-primary",
    text: "Отличный опыт. Задача была подробно описана, документация на API предоставлена. Коммуникация на высшем уровне — ответы в течение часа.",
    tags: ["Рекомендую"],
  },
  {
    initials: "МК",
    name: "Мария Козлова",
    role: "Fullstack-разработчик",
    rating: 5,
    avatarBg: "bg-primary text-white",
    text: "Приятно удивлена подходом компании. Вместо тестового задания — реальная небольшая задача с чёткими требованиями.",
    tags: ["Рекомендую"],
  },
  {
    initials: "ДС",
    name: "Дмитрий Сидоров",
    role: "Frontend-разработчик",
    rating: 4,
    avatarBg: "bg-[#F3E5F5] text-[#4A148C]",
    text: "Хороший опыт для портфолио. Задача чётко структурирована, есть понятные критерии приёмки.",
    tags: ["Рекомендую"],
  },
  {
    initials: "ОВ",
    name: "Ольга Волкова",
    role: "Тестировщик",
    rating: 5,
    avatarBg: "bg-[#E3F2FD] text-[#0D47A1]",
    text: "Задача по тестированию была интересной и реалистичной. Компания предоставила доступ к тестовому окружению.",
    tags: ["Рекомендую"],
  },
];

export default function PublicCompanyPage() {
  const params = useParams();
  const companyId = parseInt(params.id as string, 10);
  const [activeTab, setActiveTab] = useState<"tasks" | "reviews" | "about">("tasks");

  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompanyById(companyId),
    enabled: !isNaN(companyId),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["company-tasks", companyId],
    queryFn: () =>
      getTasks({
        company_id: companyId,
        limit: 50,
      }),
    enabled: !isNaN(companyId),
  });

  const activeTasks = tasks.filter(
    (t) => !["draft", "completed", "cancelled", "archived", "blocked"].includes(t.status),
  );

  if (isNaN(companyId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Компания не найдена</p>
        </div>
      </div>
    );
  }

  if (companyLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-[1200px] mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded-[12px]" />
            <div className="p-8 rounded-[24px] bg-card border border-border">
              <div className="flex gap-8">
                <div className="w-24 h-24 rounded-[20px] bg-muted/70" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-1/2 bg-muted/70 rounded-[8px]" />
                  <div className="h-4 w-1/3 bg-muted/50 rounded-[6px]" />
                  <div className="h-4 w-2/3 bg-muted/50 rounded-[6px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Компания не найдена</p>
        </div>
      </div>
    );
  }

  const bgColor = getCompanyColor(company.id);
  const stackTags = company.stack
    ? company.stack.split(",").map((s) => s.trim())
    : [];
  const initial = company.name?.[0] || "?";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors no-underline">
              Главная
            </Link>
            <ChevronRight size={14} className="text-muted-foreground" />
            <Link href="/companies" className="hover:text-primary transition-colors no-underline">
              Компании
            </Link>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground">{company.name || "Компания"}</span>
          </div>
        </div>
      </div>

      {/* Company Header */}
      <section className="pt-10 pb-0">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="p-8 rounded-[24px] bg-card border border-border">
            <div className="flex gap-8 items-start">
              {/* Logo */}
              <div className={`w-24 h-24 rounded-[20px] flex items-center justify-center text-[42px] font-bold shrink-0 ${bgColor}`}>
                {initial}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[32px] font-bold font-display text-foreground">
                    {company.name || "Неизвестная компания"}
                  </h1>
                  {company.verification_status === "verified" && (
                    <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[12px] font-medium">
                      <CheckVerified size={14} />
                      Верифицирована
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[14px] text-muted-foreground mb-4">
                  {company.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {company.city}
                    </span>
                  )}
                  {company.company_size && (
                    <span className="flex items-center gap-1.5">
                      <Building size={16} />
                      {company.company_size}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    На платформе с {new Date(company.created_at).toLocaleDateString("ru-RU", { year: "numeric" })}
                  </span>
                </div>

                {company.description && (
                  <p className="text-muted-foreground leading-relaxed max-w-[640px] mb-6">
                    {company.description}
                  </p>
                )}

                {stackTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {stackTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity no-underline"
                    >
                      <ExternalLink size={16} />
                      Сайт компании
                    </a>
                  )}
                  {activeTasks.length > 0 && (
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors cursor-pointer"
                    >
                      <Grid size={16} />
                      Задачи компании
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Layers size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary">{tasks.length}</div>
              <div className="text-[13px] text-muted-foreground mt-1">Всего задач</div>
            </div>
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Briefcase size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary">{activeTasks.length}</div>
              <div className="text-[13px] text-muted-foreground mt-1">Активных задач</div>
            </div>
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Users size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary">
                {tasks.reduce((s, t) => s + t.participant_count, 0)}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1">Участников</div>
            </div>
            <div className="p-5 rounded-[20px] bg-card border border-border text-center">
              <Grid size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-[28px] font-bold font-display text-primary">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-[13px] text-muted-foreground mt-1">Завершено</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-8">
            {([
              { key: "tasks" as const, label: "Задачи", count: activeTasks.length },
              { key: "reviews" as const, label: "Отзывы", count: MOCK_REVIEWS.length },
              { key: "about" as const, label: "О компании", count: null },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-[14px] font-medium -mb-px border-b-2 flex items-center gap-2 bg-transparent cursor-pointer transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="flex flex-col gap-6">
              {activeTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[15px] text-muted-foreground">У компании пока нет активных задач</p>
                </div>
              ) : (
                activeTasks.map((task: TaskListItem) => {
                  const difficultyLabel = task.difficulty
                    ? TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty
                    : null;
                  const statusLabel = TASK_STATUS_LABELS[task.status] || task.status;

                  return (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="group p-6 rounded-[24px] bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline block active:scale-[0.96]"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center text-[18px] font-bold shrink-0 ${bgColor}`}>
                            {initial}
                          </div>
                          <div>
                            <div className="text-[14px] font-semibold text-foreground">
                              {company.name || "Компания"}
                            </div>
                            {company.city && (
                              <div className="text-[12px] text-muted-foreground">{company.city}</div>
                            )}
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          {statusLabel}
                        </span>
                      </div>

                      <h3 className="text-[17px] font-semibold text-foreground mb-2 leading-snug">
                        {task.title}
                      </h3>
                      {task.summary && (
                        <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                          {task.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {task.skills?.slice(0, 4).map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium"
                          >
                            {skill.skill_name || `#${skill.skill_id}`}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-4">
                        {difficultyLabel && (
                          <span className="flex items-center gap-1.5">
                            <Layers size={14} />
                            {difficultyLabel}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            до {new Date(task.deadline).toLocaleDateString("ru-RU")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-[13px] text-muted-foreground">
                          <Users size={14} className="inline mr-1" />
                          {task.participant_count}/{task.participant_limit} мест
                        </span>
                        <span className="inline-flex items-center px-4 py-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96]">
                          Подробнее
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.name} className="p-6 rounded-[24px] bg-card border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold ${review.avatarBg}`}>
                      {review.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-foreground">{review.name}</div>
                      <div className="text-[12px] text-muted-foreground">{review.role}</div>
                    </div>
                    <div className="ml-auto">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{review.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center h-6 px-2 rounded-full text-[12px] font-medium ${
                          tag === "Рекомендую"
                            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="p-8 rounded-[24px] bg-card border border-border max-w-[720px]">
              <h3 className="text-[20px] font-bold font-display text-foreground mb-4">О компании</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {company.description || "Нет описания"}
              </p>

              {stackTags.length > 0 && (
                <>
                  <h4 className="text-[16px] font-semibold text-foreground mb-3">Технологический стек</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {stackTags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-[8px] bg-muted text-muted-foreground text-[13px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <h4 className="text-[16px] font-semibold text-foreground mb-3">Контакты</h4>
              <div className="flex flex-col gap-2 text-[14px] text-muted-foreground">
                {company.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {company.city}
                  </div>
                )}
                {company.company_size && (
                  <div className="flex items-center gap-2">
                    <Building size={16} />
                    {company.company_size}
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-center gap-2">
                    <Grid size={16} />
                    {company.industry}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
