"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTaskStatus } from "@entities/task";
import type { TaskCreatePayload } from "@entities/task";
import { getSkills } from "@entities/skill";
import { getCategories } from "@entities/category";
import { Header } from "@widgets/header";
import { X, Check } from "@shared/ui/Icons";

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [format, setFormat] = useState("");
  const [deadline, setDeadline] = useState("");
  const [participantLimit, setParticipantLimit] = useState(1);
  const [expectedResult, setExpectedResult] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [requirements, setRequirements] = useState("");
  const [advantages, setAdvantages] = useState("");
  const [materialsLinks, setMaterialsLinks] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [allowedTools, setAllowedTools] = useState("");
  const [careerOpportunities, setCareerOpportunities] = useState("");
  const [portfolioPolicy, setPortfolioPolicy] = useState("");
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  // Selected skills
  const [selectedSkills, setSelectedSkills] = useState<{ skillId: number; isRequired: boolean }[]>([]);

  // Load reference data
  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 300_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 300_000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async ({ payload, sendToModeration }: { payload: TaskCreatePayload; sendToModeration: boolean }) => {
      const task = await createTask(payload);
      if (sendToModeration) {
        await updateTaskStatus(task.id, "moderation");
      }
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "catalog"] });
      router.push("/company/tasks");
    },
  });

  const handleSubmit = async (_status: "draft" | "moderation") => {
    if (!title.trim()) return;

    const payload: TaskCreatePayload = {
      title: title.trim(),
      summary: summary.trim() || null,
      description: description.trim() || null,
      category_id: categoryId ? Number(categoryId) : null,
      difficulty: difficulty || null,
      format: format || null,
      deadline: deadline || null,
      participant_limit: participantLimit,
      expected_result: expectedResult.trim() || null,
      acceptance_criteria: acceptanceCriteria.trim() || null,
      requirements: requirements.trim() || null,
      advantages: advantages.trim() || null,
      materials_links: materialsLinks.trim() || null,
      restrictions: restrictions.trim() || null,
      allowed_tools: allowedTools.trim() || null,
      career_opportunities: careerOpportunities.trim() || null,
      portfolio_policy: portfolioPolicy.trim() || null,
      skills: selectedSkills.map((s) => ({
        skill_id: s.skillId,
        level: null,
        is_required: s.isRequired,
      })),
    };

    createMutation.mutate({ payload, sendToModeration: _status === "moderation" });
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills((prev) => {
      const exists = prev.find((s) => s.skillId === skillId);
      if (exists) return prev.filter((s) => s.skillId !== skillId);
      return [...prev, { skillId, isRequired: true }];
    });
  };

  const toggleRequired = (skillId: number) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, isRequired: !s.isRequired } : s)),
    );
  };

  const skillsByCategory = (catId: number | null) => {
    if (catId === null) return [];
    return skills.filter((s) => s.category_id === catId);
  };

  const localSkills = skills.filter((s) => !s.category_id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-6">
          <Link href="/company/tasks" className="hover:text-primary transition-colors no-underline">Задачи</Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-foreground">Создание</span>
        </div>

        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">Создание задачи</h1>

        {/* Form */}
        <div className="flex flex-col gap-8">
          {/* Basic Info */}
          <section className="p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-5">Основная информация</h2>

            <div className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Название задачи <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Telegram-бот для автоматизации заявок"
                  className="w-full h-[52px] px-4 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                  maxLength={255}
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Краткое описание
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Кратко опишите суть задачи (до 500 символов)"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                  maxLength={500}
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Полное описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробно опишите задачу, контекст, цели и ожидаемый результат. Чем подробнее — тем выше шанс найти подходящего исполнителя."
                  className="w-full h-[160px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Parameters */}
          <section className="p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-5">Параметры</h2>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Категория</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-[52px] px-4 pr-8 rounded-[16px] bg-background border border-border text-[15px] text-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_16px_center] bg-no-repeat cursor-pointer"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.direction ? `— ${cat.direction}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Сложность</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-[52px] px-4 pr-8 rounded-[16px] bg-background border border-border text-[15px] text-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_16px_center] bg-no-repeat cursor-pointer"
                >
                  <option value="">Выберите сложность</option>
                  <option value="beginner">Для начинающих</option>
                  <option value="intermediate">Средняя</option>
                  <option value="advanced">Продвинутая</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Формат работы</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-[52px] px-4 pr-8 rounded-[16px] bg-background border border-border text-[15px] text-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_16px_center] bg-no-repeat cursor-pointer"
                >
                  <option value="">Выберите формат</option>
                  <option value="remote">Удалённо</option>
                  <option value="mixed">Гибрид</option>
                  <option value="onsite">В офисе</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Крайний срок
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-[52px] px-4 rounded-[16px] bg-background border border-border text-[15px] text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">
                  Количество исполнителей
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => setParticipantLimit(n)}
                      className={`w-[52px] h-[52px] rounded-[16px] text-[16px] font-semibold transition-[background-color,color,border-color] duration-150 ease-out cursor-pointer ${
                        participantLimit === n
                          ? "bg-primary text-white"
                          : "bg-background border border-border text-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-5">Навыки и технологии</h2>

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSkills.map((s) => {
                  const skill = skills.find((sk) => sk.id === s.skillId);
                  if (!skill) return null;
                  return (
                    <span
                      key={s.skillId}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[13px] font-medium"
                    >
                      {skill.name}
                      <button
                        onClick={() => toggleRequired(s.skillId)}
                        className={`text-[11px] px-1 py-0.5 rounded-[6px] transition-colors cursor-pointer ${
                          s.isRequired
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title={s.isRequired ? "Обязательный" : "Желательный"}
                      >
                        {s.isRequired ? "обяз." : "желат."}
                      </button>
                      <button
                        onClick={() => toggleSkill(s.skillId)}
                        className="text-primary/60 hover:text-primary transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Skills grouped by category */}
            <div className="flex flex-col gap-4">
              {categories.map((cat) => {
                const catSkills = skillsByCategory(cat.id);
                if (catSkills.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <div className="text-[13px] font-medium text-muted-foreground mb-2">{cat.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((skill) => {
                        const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-[background-color,color] duration-150 ease-out cursor-pointer ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Unassigned skills */}
              {localSkills.length > 0 && (
                <div>
                  <div className="text-[13px] font-medium text-muted-foreground mb-2">Прочее</div>
                  <div className="flex flex-wrap gap-2">
                    {localSkills.map((skill) => {
                      const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                      return (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkill(skill.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-[background-color,color] duration-150 ease-out cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {skills.length === 0 && (
              <p className="text-[14px] text-muted-foreground">Справочник навыков пока пуст. Заполните его через админ-панель.</p>
            )}
          </section>

          {/* Requirements & Results */}
          <section className="p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-5">Требования и результат</h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Обязательные требования</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Перечислите обязательные требования к кандидату"
                  className="w-full h-[100px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Дополнительные преимущества</label>
                <textarea
                  value={advantages}
                  onChange={(e) => setAdvantages(e.target.value)}
                  placeholder="Какие знания и навыки будут плюсом"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Ожидаемый результат</label>
                <textarea
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  placeholder="Что именно должен сделать участник? Какой результат вы ожидаете?"
                  className="w-full h-[100px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Критерии приёмки</label>
                <textarea
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                  placeholder="По каким критериям вы будете оценивать результат?"
                  className="w-full h-[100px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Additional */}
          <section className="p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <h2 className="text-[18px] font-bold font-display text-foreground mb-5">Дополнительно</h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Ссылки на материалы</label>
                <textarea
                  value={materialsLinks}
                  onChange={(e) => setMaterialsLinks(e.target.value)}
                  placeholder="Ссылки на документацию, API, репозитории и другие полезные материалы"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Ограничения</label>
                <textarea
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  placeholder="Технические ограничения, требования к безопасности, конфиденциальность"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Допустимые инструменты</label>
                <textarea
                  value={allowedTools}
                  onChange={(e) => setAllowedTools(e.target.value)}
                  placeholder="Какие инструменты и технологии разрешено использовать"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Карьерные возможности</label>
                <textarea
                  value={careerOpportunities}
                  onChange={(e) => setCareerOpportunities(e.target.value)}
                  placeholder="Что участник получит после выполнения: подтверждённый опыт, отзыв, рекомендацию, собеседование, стажировку?"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-foreground mb-1.5">Политика портфолио</label>
                <textarea
                  value={portfolioPolicy}
                  onChange={(e) => setPortfolioPolicy(e.target.value)}
                  placeholder="Может ли участник показать результат в портфолио? На каких условиях?"
                  className="w-full h-[80px] px-4 py-3 rounded-[16px] bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex items-center justify-between p-6 rounded-[24px] bg-card shadow-[0_0_0_1px_oklch(0_0_0_/_0.04),0_1px_3px_oklch(0_0_0_/_0.04)]">
            <div className="flex items-center gap-3">
              <span className="text-[14px] text-muted-foreground">Сохранить как черновик</span>
              <button
                onClick={() => setSaveAsDraft(!saveAsDraft)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  saveAsDraft ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    saveAsDraft ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(saveAsDraft ? "draft" : "moderation")}
                disabled={!title.trim() || createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Сохранение..." : saveAsDraft ? "Сохранить черновик" : "Отправить на модерацию"}
              </button>
            </div>
          </div>

          {/* Error */}
          {createMutation.isError && (
            <div className="p-4 rounded-[16px] bg-destructive/10 text-destructive text-[14px]">
              Ошибка при сохранении задачи. Пожалуйста, попробуйте снова.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
