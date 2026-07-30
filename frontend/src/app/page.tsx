"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Briefcase,
  Award,
  ArrowRight,
  LogIn,
  Layers,
  Clock,
} from "@shared/ui/Icons";
import { getStats } from "@entities/stats";
import { getTasks, TASK_DIFFICULTY_LABELS } from "@entities/task";
import type { TaskListItem } from "@entities/task";

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

function getTaskColor(id: number): string {
  return LIGHT_BG_COLORS[id % LIGHT_BG_COLORS.length];
}

function getDifficultyLabel(difficulty: string | null): string | null {
  if (!difficulty) return null;
  return TASK_DIFFICULTY_LABELS[difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || difficulty;
}

function getInitials(name: string | null): string {
  return name?.[0] || "?";
}

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: getStats,
    staleTime: 60_000,
  });

  const { data: popularTasks = [] } = useQuery({
    queryKey: ["popular-tasks"],
    queryFn: () => getTasks({ sort: "popular", limit: 4 }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main>
        {/* Hero */}
        <section className="pt-24 pb-16">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 h-7 px-3 text-xs">
              Реальные задачи от IT-компаний
            </Badge>
            <h1 className="text-[44px] md:text-[56px] font-bold font-display text-foreground leading-[1.1] mb-6 max-w-[800px] mx-auto">
              Начните карьеру с&nbsp;реальных проектов
            </h1>
            <p className="text-lg text-muted-foreground max-w-[560px] mx-auto mb-10 leading-relaxed">
              Выполняйте задачи от IT-компаний, подтверждайте навыки и получайте приглашения на стажировку или работу.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-2"
              >
                Начать бесплатно
                <ArrowRight size={16} strokeWidth={2} />
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center justify-center h-12 px-8 rounded-2xl border border-border bg-background text-sm font-medium hover:bg-muted transition-[scale,background-color,border-color] duration-150 ease-out active:scale-[0.96] gap-2"
              >
                <LogIn size={16} strokeWidth={2} />
                Смотреть задачи
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12 mt-16 pt-12 border-t border-border">
              {[
                {
                  value: stats?.active_tasks != null ? `${stats.active_tasks}` : "—",
                  label: "задач",
                  icon: Briefcase,
                },
                {
                  value: stats?.companies != null ? `${stats.companies}` : "—",
                  label: "компаний",
                  icon: TrendingUp,
                },
                {
                  value: stats?.participants != null ? `${stats.participants}` : "—",
                  label: "участников",
                  icon: Users,
                },
                { value: "—", label: "успешных", icon: Award },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
                    <div className="text-2xl md:text-3xl font-bold font-display text-primary tabular-nums">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular Tasks */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground">Популярные задачи</h2>
                <p className="text-muted-foreground mt-2">Начните с востребованных проектов</p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center h-9 px-4 rounded-2xl border border-border bg-background text-sm font-medium hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-1.5 no-underline"
              >
                Все задачи
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularTasks.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Загрузка задач…
                </div>
              )}
              {popularTasks.map((task: TaskListItem) => {
                const initials = getInitials(task.company_name);
                const colorClass = getTaskColor(task.id);
                const difficultyLabel = getDifficultyLabel(task.difficulty);
                const spotsAvailable = task.participant_limit - task.participant_count;
                const deadline = task.deadline
                  ? `до ${new Date(task.deadline).toLocaleDateString("ru-RU")}`
                  : null;

                return (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="block no-underline"
                  >
                    <Card className="group cursor-pointer hover:shadow-sm transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${colorClass}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {task.company_name || "Компания"}
                              </div>
                              <div className="text-xs text-muted-foreground">IT-компания</div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[11px] h-5">
                            Набор открыт
                          </Badge>
                        </div>

                        <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
                          {task.title}
                        </h3>
                        {task.summary && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                            {task.summary}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {task.skills?.slice(0, 4).map((skill) => (
                            <Badge key={skill.id} variant="outline" className="text-[11px] h-5">
                              {skill.skill_name || `#${skill.skill_id}`}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          {difficultyLabel && (
                            <span className="flex items-center gap-1.5">
                              <Layers size={14} strokeWidth={1.5} />
                              {difficultyLabel}
                            </span>
                          )}
                          {deadline && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} strokeWidth={1.5} />
                              {deadline}
                            </span>
                          )}
                          {spotsAvailable > 0 && (
                            <span>{spotsAvailable} {spotsAvailable === 1 ? "место" : "мест"}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            {task.participant_count}/{task.participant_limit} участников
                          </span>
                          <span className="inline-flex items-center justify-center h-9 px-4 rounded-2xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]">
                            Подробнее
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground mb-3">Как это работает</h2>
              <p className="text-muted-foreground">Пять простых шагов к подтверждённому опыту</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: "1", title: "Создайте профиль", desc: "Укажите навыки и технологии" },
                { step: "2", title: "Найдите задачу", desc: "Выберите по интересам и уровню" },
                { step: "3", title: "Подайте заявку", desc: "Расскажите о мотивации" },
                { step: "4", title: "Выполните задачу", desc: "Работайте с обратной связью" },
                { step: "5", title: "Получите результат", desc: "Опыт, отзыв, рекомендация" },
              ].map((item, i) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold font-display mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  {i < 4 && (
                    <div className="hidden md:block w-full h-[2px] bg-border mt-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Whom */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground mb-3">Для кого это</h2>
              <p className="text-muted-foreground">Платформа подходит и участникам, и компаниям</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Участникам",
                  desc: "Получите подтверждённый опыт, отзывы от компаний и реальные карьерные возможности. Дополните портфолио кейсами.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  ),
                  action: "Начать как участник",
                  href: "/register",
                },
                {
                  title: "Компаниям",
                  desc: "Публикуйте задачи, находите мотивированных исполнителей и формируйте кадровый резерв из проверенных специалистов.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  ),
                  action: "Для компаний",
                  href: "/how-it-works",
                },
                {
                  title: "Безопасно",
                  desc: "Небольшие задачи без доступа к критическим данным. Политика конфиденциальности защищает обе стороны.",
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  ),
                  action: "Как это работает",
                  href: "/how-it-works",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="pt-8 pb-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold font-display text-foreground mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
                    <a
                      href={item.href}
                      className="inline-flex items-center justify-center h-9 px-4 rounded-2xl border border-border bg-background text-xs font-medium hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-1.5"
                    >
                      <ArrowRight size={12} strokeWidth={2.5} />
                      {item.action}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="p-10 md:p-14 rounded-2xl bg-primary text-primary-foreground text-center">
              <h2 className="text-[28px] md:text-[36px] font-bold font-display mb-4">Готовы попробовать?</h2>
              <p className="text-base text-primary-foreground/80 mb-8 max-w-[480px] mx-auto">
                Создайте аккаунт и найдите первую задачу уже сегодня. Это бесплатно.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-primary-foreground text-primary text-sm font-medium hover:bg-primary-foreground/90 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-2"
                >
                  <ArrowRight size={16} strokeWidth={2} />
                  Зарегистрироваться
                </a>
                <a
                  href="/catalog"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-2xl border-2 border-primary-foreground/30 text-primary-foreground text-sm font-medium hover:bg-primary-foreground/10 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]"
                >
                  Смотреть задачи
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
