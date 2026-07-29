"use client";

import { useUnit } from "effector-react";
import Link from "next/link";
import { $user } from "@features/auth";
import { useQuery } from "@tanstack/react-query";
import { getMyCompanyTasks } from "@entities/task";
import { Header } from "@widgets/header";
import { Plus, Layers, UserPlus, Clock, Award } from "@shared/ui/Icons";

const applications = [
  {
    name: "Алексей Петров",
    initials: "АП",
    level: "Junior",
    task: "Telegram-бот для автоматизации заявок",
    time: "2 часа назад",
    tags: ["Node.js", "PostgreSQL", "Telegram Bot API"],
    avatarBg: "bg-primary/10 text-primary",
  },
  {
    name: "Мария Козлова",
    initials: "МК",
    level: "Middle",
    task: "Telegram-бот для автоматизации заявок",
    time: "5 часов назад",
    tags: ["Node.js", "TypeScript", "Docker"],
    avatarBg: "bg-primary text-white",
  },
  {
    name: "Дмитрий Сидоров",
    initials: "ДС",
    level: "Junior",
    task: "Автотесты для модуля авторизации",
    time: "1 день назад",
    tags: ["TypeScript", "Playwright", "Cypress"],
    avatarBg: "bg-[#F3E5F5] text-[#4A148C]",
  },
];

const activeTasks = [
  {
    title: "Telegram-бот для автоматизации заявок",
    assignee: "Мария Козлова",
    timeLeft: "Осталось 10 дней",
    progress: 60,
    status: "В работе",
    statusClass: "text-primary bg-primary/10",
  },
  {
    title: "API-интеграция с платёжной системой",
    assignee: "Алексей Петров",
    timeLeft: "Результат отправлен",
    progress: 90,
    status: "На проверке",
    statusClass: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
  },
];

export default function CompanyDashboardPage() {
  const user = useUnit($user);
  const companyName = user?.company_name || "Компания";

  const { data: tasks = [] } = useQuery({
    queryKey: ["company-tasks"],
    queryFn: getMyCompanyTasks,
    staleTime: 10_000,
  });

  const publishedTasks = tasks.filter(
    (t) => !["draft", "completed", "cancelled", "archived", "blocked"].includes(t.status),
  );
  const activeTasks = tasks.filter((t) => ["selected", "in_progress", "review", "rework"].includes(t.status));
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold font-display text-foreground">Обзор</h1>
            <p className="text-[15px] text-muted-foreground mt-1">{companyName}</p>
          </div>
          <Link
            href="/company/tasks/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
          >
            <Plus size={16} />
            Создать задачу
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { value: publishedTasks.length, label: "Активных задач", icon: Layers },
            { value: tasks.reduce((s, t) => s + (t.status === "open" ? t.participant_count : 0), 0), label: "Новых заявок", icon: UserPlus },
            { value: activeTasks.length, label: "В работе", icon: Clock },
            { value: completedCount, label: "Завершено", icon: Award },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-[20px] bg-card border border-border text-center">
                <Icon size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-[28px] font-bold font-display text-primary">{stat.value}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          <Link
            href="/company/tasks"
            className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary -mb-px flex items-center gap-2 bg-transparent no-underline"
          >
            Мои задачи
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              {tasks.length}
            </span>
          </Link>
        </div>

        {/* New Applications */}
        <div className="flex flex-col gap-3 mb-10">
          {applications.map((app) => (
            <div
              key={app.name}
              className="p-4 rounded-[20px] bg-card border border-border hover:border-muted-foreground/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${app.avatarBg}`}>
                  {app.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-[14px] text-foreground">{app.name}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[11px] font-medium">
                      {app.level}
                    </span>
                  </div>
                  <div className="text-[13px] text-muted-foreground mb-2">
                    Подал заявку на «{app.task}» · {app.time}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-[6px] bg-muted text-muted-foreground text-[11px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-4 py-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-opacity cursor-pointer">
                    Посмотреть
                  </button>
                  <button className="px-4 py-2 text-[13px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors cursor-pointer">
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Tasks */}
        <div>
          <h3 className="text-[18px] font-bold font-display text-foreground mb-4">Активные задачи</h3>
          <div className="flex flex-col gap-3">
            {activeTasks.map((task) => (
              <div
                key={task.title}
                className="p-4 rounded-[20px] bg-card border border-border hover:border-muted-foreground/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-[12px] bg-[#E8F4F4] text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                    V
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="font-semibold text-[15px] text-foreground">{task.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium shrink-0 ${task.statusClass}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground mb-3">
                      <span>Исполнитель: {task.assignee}</span>
                      <span>·</span>
                      <span>{task.timeLeft}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-medium text-primary">{task.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
