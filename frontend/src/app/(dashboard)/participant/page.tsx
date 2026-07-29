"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { Header } from "@widgets/header";
import { Search, Clock, Layers, Award, Star } from "@shared/ui/Icons";

const applications = [
  {
    company: "Verba Tech",
    companyInitial: "V",
    bgColor: "bg-[#E8F4F4] text-primary",
    title: "Telegram-бот для автоматизации заявок",
    status: "На рассмотрении",
    statusClass: "badge-info",
    date: "Подана 2 дня назад",
    duration: "14 дней",
  },
  {
    company: "DataFlow",
    companyInitial: "D",
    bgColor: "bg-[#FFF3E0] text-[#E65100]",
    title: "Дизайн UI-компонента дашборда",
    status: "Принята",
    statusClass: "badge-success",
    date: "Подана 5 дней назад",
    duration: "10 дней",
  },
  {
    company: "PixelForge",
    companyInitial: "P",
    bgColor: "bg-[#F3E5F5] text-[#4A148C]",
    title: "Автотесты для модуля авторизации",
    status: "Просмотрена",
    statusClass: "badge-warning",
    date: "Подана 1 неделю назад",
    duration: "7 дней",
  },
];

const experiences = [
  {
    title: "Лендинг для стартапа",
    company: "CloudNine",
    date: "Ноя 2025",
    skills: ["React", "CSS"],
    rating: 4,
  },
  {
    title: "UX-аудит мобильного приложения",
    company: "DataFlow",
    date: "Дек 2025",
    skills: ["UI/UX", "Figma"],
    rating: 5,
  },
];

export default function ParticipantDashboardPage() {
  const user = useUnit($user);
  const userName = user?.first_name || "Участник";
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
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
            { value: "3", label: "Активные заявки", icon: Layers },
            { value: "1", label: "В работе", icon: Clock },
            { value: "2", label: "Завершено", icon: Award },
            { value: "4.7", label: "Рейтинг", icon: Star },
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
            { label: "Мои заявки", count: 3 },
            { label: "В работе", count: 1 },
            { label: "Завершённые", count: 2 },
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

        {/* Applications List */}
        <div className="flex flex-col gap-3 mb-10">
          {applications.map((app) => (
            <div
              key={app.title}
              className="p-4 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] cursor-pointer active:scale-[0.96]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center text-[18px] font-bold shrink-0 ${app.bgColor}`}>
                  {app.companyInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="font-semibold text-[15px] text-foreground truncate">{app.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium shrink-0 ${
                      app.statusClass === "badge-info" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                      app.statusClass === "badge-success" ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                    <span>{app.company}</span>
                    <span>·</span>
                    <span>{app.date}</span>
                    <span>·</span>
                    <span>{app.duration}</span>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Active Task */}
        <div className="mb-10">
          <h3 className="text-[18px] font-bold font-display text-foreground mb-4">Активная задача</h3>
          <div className="p-5 rounded-3xl bg-card border border-border">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[12px] bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center text-[18px] font-bold shrink-0">
                M
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-[15px] text-foreground">API-интеграция с платёжной системой</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium shrink-0">
                    В работе
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-muted-foreground mb-3">
                  <span>MindBridge</span>
                  <span>·</span>
                  <span>Осталось 12 дней</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: "35%" }} />
                  </div>
                  <span className="text-[13px] font-medium text-primary">35%</span>
                </div>
              </div>
              <button className="px-4 py-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity shrink-0">
                Открыть
              </button>
            </div>
          </div>
        </div>

        {/* Verified Experience */}
        <div>
          <h3 className="text-[18px] font-bold font-display text-foreground mb-4">Подтверждённый опыт</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiences.map((exp) => (
              <div key={exp.title} className="p-5 rounded-3xl bg-card border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-[15px] text-foreground">{exp.title}</div>
                    <div className="text-[13px] text-muted-foreground mt-0.5">{exp.company} · {exp.date}</div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-[12px] font-medium shrink-0">
                    Завершено
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  {exp.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[12px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= exp.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}
                    />
                  ))}
                  <span className="text-[13px] text-muted-foreground ml-1">{exp.rating}.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
