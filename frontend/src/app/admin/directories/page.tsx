"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user, $isHydrated } from "@features/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  type Category,
} from "@entities/category";
import {
  getSkills,
  createSkill,
  updateSkill,
  type Skill,
} from "@entities/skill";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  ArrowLeft,
  Plus,
  Check,
  Layers,
} from "@shared/ui/Icons";

export default function AdminDirectoriesPage() {
  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "skills">("categories");

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [newCatDir, setNewCatDir] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");

  // Skill form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCat, setNewSkillCat] = useState<number | "">("");
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editSkillName, setEditSkillName] = useState("");

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 30_000,
  });

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
    staleTime: 30_000,
  });

  const createCatMutation = useMutation({
    mutationFn: (data: { name: string; direction?: string }) =>
      createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCatName("");
      setNewCatDir("");
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      updateCategory(data.id, { name: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCat(null);
      setEditCatName("");
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: (data: { name: string; category_id?: number | null }) =>
      createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setNewSkillName("");
      setNewSkillCat("");
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: (data: { id: number; name: string }) =>
      updateSkill(data.id, { name: data.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setEditingSkill(null);
      setEditSkillName("");
    },
  });

  useEffect(() => {
    if (isHydrated && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return <LoadingSkeleton />;
  }

  if (user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground no-underline mb-6 transition-colors active:scale-[0.96]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Назад к панели
          </Link>

          <div className="mb-6">
            <h1 className="text-[28px] font-bold font-display text-foreground mb-2">
              Справочники
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Управление категориями и навыками
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            {(["categories", "skills"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[14px] font-medium bg-transparent cursor-pointer border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "categories" ? "Категории" : "Навыки"}
              </button>
            ))}
          </div>

          {activeTab === "categories" ? (
            <div>
              {/* Add Category Form */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
                />
                <input
                  type="text"
                  value={newCatDir}
                  onChange={(e) => setNewCatDir(e.target.value)}
                  placeholder="Направление (опционально)"
                  className="flex-1 h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
                />
                <button
                  onClick={() =>
                    createCatMutation.mutate({ name: newCatName, direction: newCatDir || undefined })
                  }
                  disabled={!newCatName.trim() || createCatMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 h-[52px] text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-2xl transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {/* Categories List */}
              {catsLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[60px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Layers size={36} strokeWidth={1.5} className="text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-[14px]">Нет категорий</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
                    >
                      {editingCat?.id === cat.id ? (
                        <>
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 h-10 px-3 rounded-[12px] bg-background border border-border text-[14px] text-foreground outline-none focus:border-ring transition-colors"
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              updateCatMutation.mutate({ id: cat.id, name: editCatName })
                            }
                            disabled={!editCatName.trim()}
                            className="inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] active:scale-[0.96] disabled:opacity-50 cursor-pointer"
                          >
                            <Check size={14} />
                            Сохранить
                          </button>
                          <button
                            onClick={() => { setEditingCat(null); setEditCatName(""); }}
                            className="px-3 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-[12px] hover:bg-muted transition-colors cursor-pointer"
                          >
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-[15px] text-foreground">
                            {cat.name}
                            {cat.direction && (
                              <span className="text-muted-foreground ml-2 text-[13px]">
                                — {cat.direction}
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => {
                              setEditingCat(cat);
                              setEditCatName(cat.name);
                            }}
                            className="px-3 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-[12px] hover:bg-muted transition-colors cursor-pointer"
                          >
                            ✎ Ред.
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Add Skill Form */}
              <div className="flex items-center gap-2 mb-6">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Название навыка"
                  className="flex-1 h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-ring transition-colors"
                />
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground outline-none focus:border-ring transition-colors"
                >
                  <option value="">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    createSkillMutation.mutate({
                      name: newSkillName,
                      category_id: newSkillCat || null,
                    })
                  }
                  disabled={!newSkillName.trim() || createSkillMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 h-[52px] text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-2xl transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              {/* Skills List */}
              {skillsLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[60px] w-full rounded-2xl" />
                  ))}
                </div>
              ) : skills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Layers size={36} strokeWidth={1.5} className="text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-[14px]">Нет навыков</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {skills.map((skill) => {
                    const cat = categories.find((c) => c.id === skill.category_id);
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border"
                      >
                        {editingSkill?.id === skill.id ? (
                          <>
                            <input
                              type="text"
                              value={editSkillName}
                              onChange={(e) => setEditSkillName(e.target.value)}
                              className="flex-1 h-10 px-3 rounded-[12px] bg-background border border-border text-[14px] text-foreground outline-none focus:border-ring transition-colors"
                              autoFocus
                            />
                            <button
                              onClick={() =>
                                updateSkillMutation.mutate({ id: skill.id, name: editSkillName })
                              }
                              disabled={!editSkillName.trim()}
                              className="inline-flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] active:scale-[0.96] disabled:opacity-50 cursor-pointer"
                            >
                              <Check size={14} />
                              Сохранить
                            </button>
                            <button
                              onClick={() => { setEditingSkill(null); setEditSkillName(""); }}
                              className="px-3 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-[12px] hover:bg-muted transition-colors cursor-pointer"
                            >
                              Отмена
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-[15px] text-foreground">
                              {skill.name}
                              {cat && (
                                <span className="text-muted-foreground ml-2 text-[13px]">
                                  — {cat.name}
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() => {
                                setEditingSkill(skill);
                                setEditSkillName(skill.name);
                              }}
                              className="px-3 h-9 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-[12px] hover:bg-muted transition-colors cursor-pointer"
                            >
                              ✎ Ред.
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md" />
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-8 w-full">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-8" />
      </main>
    </div>
  );
}
