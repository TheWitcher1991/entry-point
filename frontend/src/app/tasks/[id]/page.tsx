"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUnit } from "effector-react";
import { getTask, getTasks, getSavedTaskIds, toggleBookmark, TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS, TASK_FORMAT_LABELS } from "@entities/task";
import { updateTaskStatus } from "@entities/task";
import { getCompanyById } from "@entities/company";
import { getSkills } from "@entities/skill";
import { $user } from "@features/auth";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { ApplyButton } from "@features/application-apply";
import { SubmitForm } from "@features/task-submit";
import { ReviewSection } from "@features/task-review";
import { ChevronRight, Bookmark, ExternalLink, Check, Layers } from "@shared/ui/Icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Tab = "description" | "requirements" | "result" | "company";

function BookmarkButton({ taskId }: { taskId: number }) {
  const user = useUnit($user);
  const queryClient = useQueryClient();
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: savedIds = [] } = useQuery({
    queryKey: ["saved-task-ids"],
    queryFn: getSavedTaskIds,
    enabled: !!user,
  });

  const isSaved = savedIds.includes(taskId);

  const handleClick = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    await toggleBookmark(taskId);
    queryClient.invalidateQueries({ queryKey: ["saved-task-ids"] });
  };

  return (
    <>
      <div className="text-center">
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors bg-transparent cursor-pointer active:scale-[0.96]"
        >
          <Bookmark
            size={16}
            className={isSaved ? "fill-primary text-primary" : ""}
          />
          {isSaved ? "Сохранено" : "Сохранить"}
        </button>
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="p-6 sm:max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-[16px] bg-primary/10 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <DialogTitle className="text-[18px] font-bold font-display">
              Войдите в аккаунт
            </DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">
              Чтобы сохранять задачи, войдите в свой аккаунт.
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline"
              onClick={() => setLoginOpen(false)}
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors no-underline"
              onClick={() => setLoginOpen(false)}
            >
              Зарегистрироваться
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = Number(params.id);
  const user = useUnit($user);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("description");

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
    enabled: !Number.isNaN(taskId),
  });

  const { data: company } = useQuery({
    queryKey: ["company", task?.company_id],
    queryFn: () => getCompanyById(task!.company_id),
    enabled: !!task?.company_id,
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 300_000,
  });

  const { data: similarTasks = [] } = useQuery({
    queryKey: ["tasks", "similar", task?.category_id],
    queryFn: () =>
      getTasks({
        category_id: task?.category_id ?? undefined,
        status: "open",
        limit: 3,
      }),
    enabled: !!task?.category_id && !!task?.id,
    staleTime: 60_000,
  });

  const skillMap = new Map(skills.map((s) => [s.id, s.name]));

  if (Number.isNaN(taskId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">Задача не найдена</h2>
            <Link href="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1200px] mx-auto px-6 py-8 w-full">
          {/* Breadcrumbs skeleton */}
          <div className="h-4 w-48 bg-muted/70 rounded-[8px] mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
            <div className="flex flex-col gap-6">
              <div className="h-8 w-3/4 bg-muted/70 rounded-[10px] animate-pulse" />
              <div className="h-4 w-full bg-muted/50 rounded-[8px] animate-pulse" />
              <div className="h-4 w-2/3 bg-muted/50 rounded-[8px] animate-pulse" />
              <div className="h-40 w-full bg-muted/30 rounded-[16px] animate-pulse" />
            </div>
            <div className="h-80 w-full bg-muted/30 rounded-[24px] animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-[24px] font-bold font-display text-foreground mb-2">Задача не найдена</h2>
            <p className="text-muted-foreground mb-4">Возможно, задача была удалена или у вас нет доступа</p>
            <Link href="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Описание" },
    { key: "requirements", label: "Требования" },
    { key: "result", label: "Результат" },
    { key: "company", label: "О компании" },
  ];

  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const difficultyLabel = task.difficulty
    ? (TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty)
    : null;

  const formatLabel = task.format
    ? (TASK_FORMAT_LABELS[task.format as keyof typeof TASK_FORMAT_LABELS] || task.format)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border pt-6">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors no-underline">Главная</Link>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <Link href="/catalog" className="hover:text-primary transition-colors no-underline">Задачи</Link>
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            <span className="text-foreground truncate">{task.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* LEFT: Task Details */}
            <div>
              {/* Company + Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center text-[22px] font-bold shrink-0">
                    {company?.name ? company.name[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-foreground">
                      {company ? company.name : <Skeleton className="h-5 w-40" />}
                    </div>
                    {company && (
                      <div className="text-[13px] text-muted-foreground">
                        {[company.industry, company.company_size ? `${company.company_size} сотр.` : "", company.city].filter(Boolean).join(" · ") || "Компания"}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center h-8 px-3 rounded-full text-[13px] font-medium ${
                  task.status === "open"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : task.status === "completed" || task.status === "cancelled"
                    ? "bg-muted text-muted-foreground"
                    : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {TASK_STATUS_LABELS[task.status] || task.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[32px] font-bold font-display text-foreground leading-tight mb-6">
                {task.title}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {task.skills.map((s) => (
                  <span key={s.id} className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[13px] font-medium">
                    {skillMap.get(s.skill_id) || `Навык #${s.skill_id}`}
                  </span>
                ))}
                {task.category_id && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[13px] font-medium">
                    Категория {task.category_id}
                  </span>
                )}
                {difficultyLabel && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[13px] font-medium">
                    {difficultyLabel}
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border mb-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-[14px] font-medium -mb-px border-b-2 bg-transparent cursor-pointer transition-colors ${
                      activeTab === tab.key
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex flex-col gap-8">
                {activeTab === "description" && (
                  <>
                    {/* About */}
                    {task.description && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">О задаче</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.description}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {task.summary && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Кратко</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {task.summary}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {task.materials_links && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Ссылки и материалы</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.materials_links}
                        </div>
                      </div>
                    )}

                    {/* Restrictions */}
                    {task.restrictions && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Ограничения</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.restrictions}
                        </div>
                      </div>
                    )}

                    {/* Allowed Tools */}
                    {task.allowed_tools && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Допустимые инструменты</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.allowed_tools}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "requirements" && (
                  <>
                    {/* Requirements as checkmark list */}
                    {task.requirements && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Обязательные требования</h3>
                        <div className="flex flex-col gap-3">
                          {task.requirements.split("\n").filter(Boolean).map((req, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-[15px] text-muted-foreground leading-relaxed">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advantages as checkmark list */}
                    {task.advantages && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Дополнительные преимущества</h3>
                        <div className="flex flex-col gap-3">
                          {task.advantages.split("\n").filter(Boolean).map((adv, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-[15px] text-muted-foreground leading-relaxed">{adv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {task.skills.length > 0 && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Навыки</h3>
                        <div className="flex flex-wrap gap-2">
                          {task.skills.map((s) => (
                            <span
                              key={s.id}
                              className={`inline-flex items-center px-3 py-1.5 rounded-[10px] text-[13px] font-medium ${
                                s.is_required
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {skillMap.get(s.skill_id) || `Навык #${s.skill_id}`}
                              {s.level && ` · ${s.level}`}
                              {!s.is_required && " (желательно)"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "result" && (
                  <>
                    {/* Expected Result */}
                    {task.expected_result && (
                      <div>
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Ожидаемый результат</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.expected_result}
                        </div>
                      </div>
                    )}

                    {/* Acceptance Criteria */}
                    {task.acceptance_criteria && (
                      <div className="mt-6">
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Критерии приёмки</h3>
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {task.acceptance_criteria}
                        </div>
                      </div>
                    )}

                    {/* Career Opportunities */}
                    {task.career_opportunities && (
                      <div className="mt-6 p-6 rounded-3xl bg-card border border-border">
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Что получает участник</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {task.career_opportunities.split("\n").filter(Boolean).map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
                              <Check size={14} strokeWidth={2.5} className="text-primary shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Policy */}
                    {task.portfolio_policy && (
                      <div className="mt-6">
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Политика публикации результата</h3>
                        <div className="text-[14px] text-muted-foreground leading-relaxed">
                          {task.portfolio_policy}
                        </div>
                      </div>
                    )}

                    {/* IP Policy */}
                    {task.ip_policy && (
                      <div className="mt-6">
                        <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Интеллектуальные права</h3>
                        <div className="text-[14px] text-muted-foreground leading-relaxed">
                          {task.ip_policy}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {!task.expected_result && !task.acceptance_criteria && !task.career_opportunities && !task.portfolio_policy && !task.ip_policy && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </div>
                        <h4 className="text-[16px] font-bold font-display text-foreground mb-1">Результат не указан</h4>
                        <p className="text-[14px] text-muted-foreground max-w-xs">Компания пока не добавила информацию о результатах этой задачи.</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "company" && company && (
                  <div className="space-y-6">
                    {/* Company Header */}
                    <div className="flex items-center gap-5">
                      <div className="w-[72px] h-[72px] rounded-[20px] bg-primary/10 text-primary flex items-center justify-center text-[32px] font-bold shrink-0">
                        {company.name ? company.name[0].toUpperCase() : "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[22px] font-bold font-display text-foreground">{company.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[14px] text-muted-foreground">
                          {company.industry && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[12px] font-medium">
                              {company.industry}
                            </span>
                          )}
                          {company.company_size && (
                            <span>{company.company_size} сотрудников</span>
                          )}
                          {company.city && (
                            <span>· {company.city}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {company.description && (
                      <p className="text-[15px] text-muted-foreground leading-relaxed">{company.description}</p>
                    )}

                    {/* Stack tags */}
                    {company.stack && (
                      <div className="flex flex-wrap gap-2">
                        {company.stack.split(",").map((t: string) => (
                          <span key={t.trim()} className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-muted text-muted-foreground text-[13px] font-medium">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Contact & Website row */}
                    {(company.website || company.contact_name) && (
                      <div className="flex flex-wrap gap-4 pt-2">
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[14px] font-medium text-primary hover:underline"
                          >
                            <ExternalLink size={14} />
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        {company.contact_name && (
                          <span className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            {company.contact_name}{company.contact_position ? `, ${company.contact_position}` : ""}
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/companies/${company.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted hover:border-foreground/20 rounded-[14px] transition-all active:scale-[0.96] no-underline"
                    >
                      <ExternalLink size={14} />
                      Профиль компании
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:sticky lg:top-[calc(64px+32px)] flex flex-col gap-6">
              {/* Apply Card */}
              <div className="p-6 rounded-3xl bg-card border border-border">
                <div className="flex flex-col gap-5">
                  {deadlineText && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-muted-foreground">Срок выполнения</span>
                      <span className="text-[14px] font-semibold text-foreground">{deadlineText}</span>
                    </div>
                  )}
                  {difficultyLabel && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-muted-foreground">Сложность</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[12px] font-medium">
                        {difficultyLabel}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-muted-foreground">Мест</span>
                    <span className="text-[14px] font-semibold text-foreground">{task.participant_limit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-muted-foreground">Заявок</span>
                    <span className="text-[14px] font-semibold text-foreground">{task.participant_count}</span>
                  </div>
                  {formatLabel && (
                    <div className="flex justify-between items-center">
                      <span className="text-[14px] text-muted-foreground">Формат</span>
                      <span className="text-[14px] font-semibold text-foreground">{formatLabel}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-muted-foreground">Опубликовано</span>
                    <span className="text-[14px] font-semibold text-foreground">
                      {new Date(task.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    </span>
                  </div>

                  {task.status === "open" && <ApplyButton taskId={task.id} />}

                  {task.status === "in_progress" && user?.role === "participant" && (
                    <SubmitForm taskId={task.id} />
                  )}

                  {/* Company: Review submissions */}
                  <ReviewSection
                    taskId={task.id}
                    skillNames={task.skills.map((s) => skillMap.get(s.skill_id) || s.skill_name || `#${s.skill_id}`)}
                  />

                  {/* Company: Status management */}
                  {user?.role === "company" && task.status === "open" && (
                    <div className="border-t border-border pt-5">
                      <button
                        onClick={async () => {
                          await updateTaskStatus(task.id, "in_progress");
                          queryClient.invalidateQueries({ queryKey: ["task", taskId] });
                        }}
                        className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer"
                      >
                        Начать работу
                      </button>
                    </div>
                  )}

                  {user?.role === "company" && task.status === "rework" && (
                    <div className="border-t border-border pt-5">
                      <button
                        onClick={async () => {
                          await updateTaskStatus(task.id, "in_progress");
                          queryClient.invalidateQueries({ queryKey: ["task", taskId] });
                        }}
                        className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.98] cursor-pointer"
                      >
                        Вернуть в работу
                      </button>
                    </div>
                  )}

                  {user?.role === "company" && (task.status === "completed" || task.status === "cancelled") && (
                    <div className="border-t border-border pt-5">
                      <button
                        onClick={async () => {
                          await updateTaskStatus(task.id, "archived");
                          queryClient.invalidateQueries({ queryKey: ["task", taskId] });
                        }}
                        className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-muted-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-colors cursor-pointer"
                      >
                        Архивировать
                      </button>
                    </div>
                  )}

                  <BookmarkButton taskId={task.id} />
                </div>
              </div>

              {/* Company Card (sidebar) */}
              {company && (
                <div className="p-6 rounded-3xl bg-card border border-border">
                  <h4 className="text-[14px] font-semibold text-foreground mb-4">О компании</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                        {company.name ? company.name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-foreground">{company.name}</div>
                        {company.city && <div className="text-[13px] text-muted-foreground">{company.city}</div>}
                      </div>
                    </div>
                    {company.description && (
                      <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-3">
                        {company.description}
                      </p>
                    )}
                    {company.stack && (
                      <div className="flex flex-wrap gap-2">
                        {company.stack.split(",").map((t: string) => (
                          <span key={t.trim()} className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/companies/${company.id}`}
                      className="w-full h-[40px] inline-flex items-center justify-center gap-2 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                    >
                      <ExternalLink size={14} />
                      Профиль компании
                    </Link>
                  </div>
                </div>
              )}

              {/* Similar Tasks */}
              {similarTasks.length > 0 && (
                <div className="p-6 rounded-3xl bg-card border border-border">
                  <h4 className="text-[14px] font-semibold text-foreground mb-4">Похожие задачи</h4>
                  <div className="flex flex-col gap-2">
                    {similarTasks
                      .filter((t) => t.id !== task.id)
                      .slice(0, 3)
                      .map((st) => (
                        <Link
                          key={st.id}
                          href={`/tasks/${st.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted transition-colors no-underline group"
                        >
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {st.title}
                            </div>
                            <div className="text-[12px] text-muted-foreground mt-0.5">
                              <Layers size={10} className="inline mr-1" />
                              {st.difficulty ? TASK_DIFFICULTY_LABELS[st.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || st.difficulty : "—"}
                              {st.deadline && <> · до {new Date(st.deadline).toLocaleDateString("ru-RU")}</>}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
