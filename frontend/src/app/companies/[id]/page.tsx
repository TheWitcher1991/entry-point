"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { ChevronRight, ExternalLink, Grid, MapPin, Building, Clock, CheckVerified } from "@shared/ui/Icons";

const companyData = {
  id: "verba-tech",
  name: "Verba Tech",
  initial: "V",
  bg: "bg-[#E8F4F4] text-primary",
  city: "Москва",
  employees: "12 сотрудников",
  since: "На платформе с 2024",
  description: "SaaS-платформа для автоматизации бизнес-процессов. Разрабатываем инструменты, которые помогают малому и среднему бизнесу оптимизировать рутинные процессы и сосредоточиться на главном.",
  tags: ["SaaS", "Автоматизация", "B2B", "Node.js", "React", "PostgreSQL"],
  stats: [
    { value: "3", label: "Опубликованных задач" },
    { value: "12", label: "Участников привлечено" },
    { value: "10", label: "Завершено задач" },
    { value: "4.8", label: "Средний рейтинг" },
  ],
};

const tasks = [
  {
    title: "Telegram-бот для автоматизации заявок",
    desc: "Разработка бота на Node.js для обработки пользовательских заявок с интеграцией в CRM-систему.",
    tags: ["Node.js", "Telegram Bot API", "PostgreSQL"],
    time: "14 дней",
    level: "Средняя",
    spots: "3 места",
    applicants: 12,
    badge: "Набор открыт",
    badgeClass: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    title: "API-интеграция с платёжной системой",
    desc: "Интеграция REST API платёжного провайдера. Создание платежей, проверка статусов, вебхуки.",
    tags: ["Python", "FastAPI", "REST API"],
    time: "21 день",
    level: "Средняя",
    spots: "1 место",
    applicants: 5,
    badge: "Набор открыт",
    badgeClass: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    title: "Лендинг для нового продукта",
    desc: "Вёрстка адаптивного лендинга по готовому макету в Figma с анимациями и интеграцией формы заявки.",
    tags: ["HTML", "CSS", "JavaScript"],
    time: "7 дней",
    level: "Лёгкая",
    spots: "2 места",
    applicants: 0,
    badge: "Завершена",
    badgeClass: "text-muted-foreground bg-muted",
  },
];

const reviews = [
  {
    initials: "АП",
    name: "Алексей Петров",
    role: "Backend-разработчик",
    rating: 5,
    avatarBg: "bg-[#E8F4F4] text-primary",
    text: "Отличный опыт. Задача была подробно описана, документация на API предоставлена. Коммуникация на высшем уровне — ответы в течение часа. Получил полезный опыт интеграции с реальным платёжным провайдером.",
    tags: ["Задача: API-интеграция", "Рекомендую"],
  },
  {
    initials: "МК",
    name: "Мария Козлова",
    role: "Fullstack-разработчик",
    rating: 5,
    avatarBg: "bg-primary text-white",
    text: "Приятно удивлена подходом компании. Вместо тестового задания — реальная небольшая задача с чёткими требованиями. После выполнения получила подробный отзыв и предложение о стажировке.",
    tags: ["Задача: Telegram-бот", "Рекомендую"],
  },
  {
    initials: "ДС",
    name: "Дмитрий Сидоров",
    role: "Frontend-разработчик",
    rating: 4,
    avatarBg: "bg-[#F3E5F5] text-[#4A148C]",
    text: "Хороший опыт для портфолио. Задача чётко структурирована, есть понятные критерии приёмки. Единственное — хотелось бы более оперативной обратной связи в процессе работы.",
    tags: ["Задача: Лендинг", "Рекомендую"],
  },
  {
    initials: "ОВ",
    name: "Ольга Волкова",
    role: "Тестировщик",
    rating: 5,
    avatarBg: "bg-[#E3F2FD] text-[#0D47A1]",
    text: "Задача по тестированию была интересной и реалистичной. Компания предоставила доступ к тестовому окружению и подробную документацию. Рекомендую для начинающих тестировщиков.",
    tags: ["Задача: Автотесты", "Рекомендую"],
  },
];

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

export default function PublicCompanyPage() {
  const params = useParams();
  const companyId = params.id as string;
  const company = companyData.id === companyId ? companyData : { ...companyData, id: companyId };

  const [activeTab, setActiveTab] = useState<"tasks" | "reviews" | "about">("tasks");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors no-underline">Главная</a>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground">{company.name}</span>
          </div>
        </div>
      </div>

      {/* Company Header */}
      <section className="pt-10 pb-0">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="p-8 rounded-[24px] bg-card border border-border">
            <div className="flex gap-8 items-start">
              {/* Logo */}
              <div className={`w-24 h-24 rounded-[20px] flex items-center justify-center text-[42px] font-bold shrink-0 ${company.bg}`}>
                {company.initial}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[32px] font-bold font-display text-foreground">{company.name}</h1>
                  <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[12px] font-medium">
                    <CheckVerified size={14} />
                    Верифицирована
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[14px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {company.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building size={16} />
                    {company.employees}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {company.since}
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed max-w-[640px] mb-6">
                  {company.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {company.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity no-underline"
                  >
                    <ExternalLink size={16} />
                    Сайт компании
                  </a>
                  <a
                    href="/catalog"
                    className="inline-flex items-center gap-2 h-[40px] px-5 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                  >
                    <Grid size={16} />
                    Задачи компании
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-4 gap-6">
            {company.stats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-[20px] bg-card border border-border text-center">
                <div className="text-[28px] font-bold font-display text-primary">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs + Content */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-8">
          {([
            { key: "tasks" as const, label: "Задачи", count: 3 },
            { key: "reviews" as const, label: "Отзывы", count: 8 },
            { key: "about" as const, label: "О компании", count: null },
          ]).map((tab: { key: string; label: string; count: number | null }) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
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
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className={`p-6 rounded-[24px] bg-card border border-border hover:border-muted-foreground/20 transition-colors ${
                    task.badge === "Завершена" ? "opacity-70" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center text-[18px] font-bold shrink-0 ${company.bg}`}>
                        {company.initial}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-foreground">{company.name}</div>
                        <div className="text-[12px] text-muted-foreground">Стартап · {company.city}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${task.badgeClass}`}>
                      {task.badge}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-foreground mb-2 leading-snug">{task.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">{task.desc}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />{task.time}
                    </span>
                    <span>{task.level}</span>
                    <span>{task.spots}</span>
                  </div>

                  {task.badge !== "Завершена" && (
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-[13px] text-muted-foreground">{task.applicants} заявок</span>
                      <a
                        href={`/tasks/${task.title.toLowerCase().replace(/[^a-zа-яё0-9]+/g, "-").replace(/-+$/, "")}`}
                        className="inline-flex items-center px-4 py-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity no-underline"
                      >
                        Подробнее
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-2 gap-6">
              {reviews.map((review) => (
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
              <p className="text-muted-foreground leading-relaxed mb-6">{company.description}</p>

              <h4 className="text-[16px] font-semibold text-foreground mb-3">Технологический стек</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {company.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-[8px] bg-muted text-muted-foreground text-[13px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <h4 className="text-[16px] font-semibold text-foreground mb-3">Контакты</h4>
              <div className="flex flex-col gap-2 text-[14px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {company.city}
                </div>
                <div className="flex items-center gap-2">
                  <Building size={16} />
                  {company.employees}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
