"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Briefcase,
  Award,
  ArrowRight,
  Layers,
  Star,
  Activity,
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

const CONFETTI_COLORS = [
  "bg-[#166666]",
  "bg-[#E65100]",
  "bg-[#0D47A1]",
  "bg-[#4A148C]",
  "bg-[#2EC4B6]",
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

const testimonials = [
  {
    name: "Анна К.",
    role: "Frontend-разработчик",
    text: "После выполнения трёх задач получила оффер от компании. Подтверждённые навыки в профиле работают лучше любого резюме.",
    rating: 5,
  },
  {
    name: "Михаил С.",
    role: "Backend-стажёр",
    text: "Отличная возможность попробовать реальные проекты без страха провала. Конструктивная обратная связь от компаний — бесценна.",
    rating: 5,
  },
  {
    name: "Екатерина В.",
    role: "Product Analyst",
    text: "За три месяца собрала портфолио из 5 кейсов. HR-ы из компаний сами находят и приглашают на собеседования.",
    rating: 5,
  },
];

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: getStats,
    staleTime: 60_000,
  });

  const { data: popularTasks = [], isLoading: isPopularLoading } = useQuery({
    queryKey: ["popular-tasks"],
    queryFn: () => getTasks({ sort: "popular", limit: 4 }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main>
        {/* ───── HERO ───── */}
        <section className="relative pt-28 pb-16 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-primary/[0.04] dark:bg-primary/[0.06] blur-3xl" />
            <div className="absolute bottom-[-100px] left-[-60px] w-[350px] h-[350px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.05] blur-3xl" />
            <div className="absolute top-[30%] left-[20%] w-[6px] h-[6px] rounded-full bg-primary/20" />
            <div className="absolute top-[20%] right-[30%] w-[4px] h-[4px] rounded-full bg-primary/20" />
            <div className="absolute bottom-[40%] right-[15%] w-[8px] h-[8px] rounded-full bg-primary/15" />
            <div className="absolute top-[60%] left-[10%] w-[5px] h-[5px] rounded-full bg-primary/20" />
          </div>

          <div className="max-w-[1200px] mx-auto px-6 text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 h-7 px-3 rounded-full border border-primary/20 bg-primary/5 text-primary text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Реальные задачи от IT-компаний
            </div>

            {/* Heading */}
            <h1 className="text-[44px] md:text-[60px] font-bold font-display text-foreground leading-[1.05] mb-5 max-w-[820px] mx-auto">
              Преврати знания в&nbsp;подтверждённый&nbsp;опыт
            </h1>

            {/* Subtitle */}
            <p className="text-[17px] md:text-[18px] text-muted-foreground max-w-[560px] mx-auto mb-10 leading-relaxed">
              Выполняй задачи от IT-компаний, получай фидбек и приглашения на работу. Бесплатно.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <a
                href="/register"
                className="group inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl bg-primary text-primary-foreground text-[14px] md:text-[15px] font-semibold hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2 shadow-sm"
              >
                Начать бесплатно
                <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl border border-border bg-background text-[14px] md:text-[15px] font-medium text-foreground hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-3"
              >
                <Layers size={16} strokeWidth={2} />
                Смотреть задачи
              </a>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 pt-10 border-t border-border max-w-[800px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { value: stats?.active_tasks != null ? `${stats.active_tasks}` : "—", label: "активных задач", icon: Briefcase },
                  { value: stats?.companies != null ? `${stats.companies}` : "—", label: "компаний", icon: TrendingUp },
                  { value: stats?.participants != null ? `${stats.participants}` : "—", label: "участников", icon: Users },
                  { value: "скоро", label: "выполнено", icon: Award },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <Icon size={18} className="text-primary mx-auto mb-1.5" strokeWidth={1.5} />
                      <div className="text-[26px] md:text-[30px] font-bold font-display text-foreground tabular-nums leading-none mb-1">
                        {stat.value}
                      </div>
                      <div className="text-[13px] text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ───── POPULAR TASKS ───── */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary mb-2">
                  <Activity size={14} />
                  Популярное
                </div>
                <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground">Задачи, которые выбирают чаще</h2>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-2xl border border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] no-underline shrink-0"
              >
                Все задачи
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {isPopularLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-11 w-11 rounded-xl" />
                        <div>
                          <Skeleton className="h-4 w-28 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3].map((j) => (
                          <Skeleton key={j} className="h-6 w-16 rounded-full" />
                        ))}
                      </div>
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))
              ) : popularTasks.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
                    <Layers size={28} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-[18px] font-bold font-display text-foreground mb-2">Пока нет задач</h3>
                  <p className="text-[14px] text-muted-foreground max-w-sm">
                    Задачи появятся здесь, когда компании начнут публиковать предложения
                  </p>
                </div>
              ) : (
                popularTasks.map((task: TaskListItem) => {
                  const initials = getInitials(task.company_name);
                  const colorClass = getTaskColor(task.id);
                  const difficultyLabel = getDifficultyLabel(task.difficulty);
                  const deadline = task.deadline
                    ? `до ${new Date(task.deadline).toLocaleDateString("ru-RU")}`
                    : null;

                  return (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="group block no-underline active:scale-[0.98] transition-transform duration-150 ease-out"
                    >
                      <Card className="h-full cursor-pointer hover:shadow-md transition-[box-shadow] duration-200">
                        <CardContent className="pt-6 flex flex-col h-full">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold shrink-0 ${colorClass}`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[14px] font-semibold text-foreground truncate">
                                  {task.company_name || "Компания"}
                                </div>
                                <div className="text-[12px] text-muted-foreground">IT-компания</div>
                              </div>
                            </div>
                            <Star size={14} className="text-primary/40" strokeWidth={1.5} />
                          </div>

                          {/* Title */}
                          <h3 className="text-[16px] font-semibold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-150">
                            {task.title}
                          </h3>
                          {task.summary && (
                            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                              {task.summary}
                            </p>
                          )}

                          {/* Skills */}
                          {task.skills && task.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {task.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium"
                                >
                                  {skill.skill_name || `#${skill.skill_id}`}
                                </span>
                              ))}
                              {task.skills.length > 4 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                                  +{task.skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Meta */}
                          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                              {difficultyLabel && <span>{difficultyLabel}</span>}
                              {deadline && <span>{deadline}</span>}
                              <span>{task.participant_count}/{task.participant_limit}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 h-8 px-3.5 rounded-xl bg-primary text-primary-foreground text-[11px] font-semibold group-hover:opacity-90 transition-opacity">
                              Подробнее
                              <ArrowRight size={11} strokeWidth={3} />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary mb-2">
                <Award size={14} />
                Как это работает
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground mb-3">
                От нуля до подтверждённого опыта за 4 шага
              </h2>
              <p className="text-muted-foreground max-w-[480px] mx-auto">
                Всё просто: создаёшь профиль, выбираешь задачу, выполняешь — получаешь результат.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 relative">
              {[
                { step: "01", title: "Заполни профиль", desc: "Укажи навыки, чтобы задачи подбирались под тебя", icon: Users },
                { step: "02", title: "Выбери задачу", desc: "Отфильтруй по сложности, формату и сроку", icon: Layers },
                { step: "03", title: "Выполни и получи фидбек", desc: "Работай в своём темпе с обратной связью от компании", icon: Activity },
                { step: "04", title: "Пополни портфолио", desc: "Подтверждённый опыт, отзыв и карьерные возможности", icon: Award },
              ].map((item, i) => (
                <div key={item.step} className="relative">
                  {/* Connecting line */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+24px)] w-[calc(100%-48px)] h-px bg-border" />
                  )}

                  <div className="relative p-6 rounded-3xl bg-card border border-border hover:border-primary/20 transition-colors duration-200 text-center md:text-left h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:mx-0 mb-4">
                      <item.icon size={22} strokeWidth={1.5} />
                    </div>
                    <div className="text-[11px] font-semibold text-primary/50 tracking-wider mb-1">{item.step}</div>
                    <h3 className="text-[16px] font-bold font-display text-foreground mb-2">{item.title}</h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── TESTIMONIALS ───── */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary mb-2">
                <Star size={14} />
                Результаты участников
              </div>
              <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground mb-3">
                Кому это помогло
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <Card key={t.name} className="hover:shadow-sm transition-shadow duration-200">
                  <CardContent className="pt-8 pb-6">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} className="text-amber-400 fill-amber-400" strokeWidth={0} />
                      ))}
                    </div>

                    <p className="text-[14px] text-foreground leading-relaxed mb-6">
                      &ldquo;{t.text}&rdquo;
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[13px] font-bold shrink-0">
                        {t.name[0]}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{t.name}</div>
                        <div className="text-[12px] text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ───── FOR WHOM ───── */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground mb-3">
                Для кого платформа
              </h2>
              <p className="text-muted-foreground max-w-[480px] mx-auto">
                Подходит и тем, кто ищет опыт, и тем, кто ищет таланты
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Participants */}
              <div className="p-8 md:p-10 rounded-3xl bg-card border border-border hover:shadow-sm transition-shadow duration-200">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Users size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-[22px] font-bold font-display text-foreground mb-3">Участникам</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  Получи подтверждённый опыт, отзывы от компаний и реальные карьерные возможности. 
                  Дополни портфолио кейсами и резюме — фактами.
                </p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {["Живые задачи от реальных IT-компаний", "Конструктивная обратная связь", "Подтверждение навыков в профиле"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-primary text-primary-foreground text-[14px] font-semibold hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2"
                >
                  Начать как участник
                  <ArrowRight size={15} strokeWidth={2.5} />
                </a>
              </div>

              {/* Companies */}
              <div className="p-8 md:p-10 rounded-3xl bg-card border border-border hover:shadow-sm transition-shadow duration-200">
                <div className="w-12 h-12 rounded-2xl bg-muted text-foreground flex items-center justify-center mb-5">
                  <Briefcase size={22} strokeWidth={1.5} />
                </div>
                <h3 className="text-[22px] font-bold font-display text-foreground mb-3">Компаниям</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  Публикуй задачи, находи мотивированных исполнителей и формируй кадровый резерв 
                  из проверенных специалистов.
                </p>
                <ul className="flex flex-col gap-2.5 mb-8">
                  {["Проверка навыков на реальных задачах", "Кадровый резерв без лишних затрат", "Бренд работодателя среди IT-специалистов"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/how-it-works"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-2xl bg-foreground text-background text-[14px] font-semibold hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2"
                >
                  Для компаний
                  <ArrowRight size={15} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ───── FINAL CTA ───── */}
        <section className="py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-primary-foreground/[0.06] blur-2xl" />
              <div className="absolute bottom-[-80px] left-[-40px] w-[250px] h-[250px] rounded-full bg-primary-foreground/[0.04] blur-2xl" />
              {CONFETTI_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${color} opacity-20 hidden md:block`}
                  style={{
                    top: `${15 + i * 18}%`,
                    right: `${8 + i * 7}%`,
                  }}
                />
              ))}

              <div className="relative">
                <div className="inline-flex items-center gap-2 mb-5 px-3 h-6 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-[12px] font-medium border border-primary-foreground/10">
                  <Star size={12} />
                  Совершенно бесплатно
                </div>
                <h2 className="text-[28px] md:text-[40px] font-bold font-display mb-4 leading-[1.1]">
                  Готов попробовать?
                </h2>
                <p className="text-[15px] md:text-[16px] text-primary-foreground/80 max-w-[480px] mx-auto mb-8 leading-relaxed">
                  Создай аккаунт, найди первую задачу и получи подтверждённый опыт — это бесплатно.
                </p>
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  <a
                    href="/register"
                    className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl bg-primary-foreground text-primary text-[14px] md:text-[15px] font-semibold hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2 shadow-sm"
                  >
                    Зарегистрироваться
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </a>
                  <a
                    href="/catalog"
                    className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl border-2 border-primary-foreground/20 text-primary-foreground text-[14px] md:text-[15px] font-medium hover:bg-primary-foreground/10 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-3"
                  >
                    <Layers size={16} strokeWidth={2} />
                    Смотреть задачи
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
