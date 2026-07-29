"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@entities/task";
import type { TaskListItem } from "@entities/task";
import { TASK_STATUS_LABELS, TASK_DIFFICULTY_LABELS, TASK_FORMAT_LABELS } from "@entities/task";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Clock,
  Layers,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Briefcase,
  MapPin,
} from "@shared/ui/Icons";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Сложность" },
  { value: "beginner", label: "Для начинающих" },
  { value: "intermediate", label: "Средняя" },
  { value: "advanced", label: "Продвинутая" },
];

const FORMAT_OPTIONS = [
  { value: "", label: "Формат" },
  { value: "remote", label: "Удалённо" },
  { value: "mixed", label: "Гибрид" },
  { value: "onsite", label: "В офисе" },
];

function TaskCard({ task }: { task: TaskListItem }) {
  const difficultyLabel = task.difficulty
    ? TASK_DIFFICULTY_LABELS[task.difficulty as keyof typeof TASK_DIFFICULTY_LABELS] || task.difficulty
    : null;
  const formatLabel = task.format
    ? TASK_FORMAT_LABELS[task.format as keyof typeof TASK_FORMAT_LABELS] || task.format
    : null;
  const statusLabel = TASK_STATUS_LABELS[task.status] || task.status;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="p-6 rounded-[24px] bg-card border border-border hover:border-muted-foreground/20 hover:shadow-md transition-all no-underline block active:scale-[0.98]"
      style={{ transitionProperty: "scale, border-color, box-shadow" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
            {task.company_id}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-foreground">Компания #{task.company_id}</div>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[12px] font-medium">
          {statusLabel}
        </span>
      </div>

      <h3 className="text-[17px] font-semibold text-foreground mb-2 line-clamp-2 leading-snug">
        {task.title}
      </h3>
      {task.summary && (
        <p className="text-[14px] text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
          {task.summary}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {task.skills?.slice(0, 4).map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium"
          >
            skill #{skill.skill_id}
          </span>
        ))}
        {(task.skills?.length ?? 0) > 4 && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
            +{task.skills.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-4">
        {difficultyLabel && (
          <span className="flex items-center gap-1.5">
            <Layers size={14} />
            {difficultyLabel}
          </span>
        )}
        {formatLabel && (
          <span className="flex items-center gap-1.5">
            <Briefcase size={14} />
            {formatLabel}
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
          <UserPlus size={14} className="inline mr-1" />
          {task.participant_count}/{task.participant_limit} мест
        </span>
        <span className="inline-flex items-center px-4 py-2 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] no-underline">
          Подробнее
        </span>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [format, setFormat] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "catalog", search, difficulty, format, sort, page],
    queryFn: () =>
      getTasks({
        status: "open",
        difficulty: difficulty || undefined,
        format: format || undefined,
        search: search || undefined,
        sort,
        offset: page * pageSize,
        limit: pageSize,
      }),
    staleTime: 30_000,
  });

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  const handleSearch = () => setSearch(searchInput.trim());

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-[36px] font-bold font-display text-foreground mb-3">Каталог задач</h1>
            <p className="text-[18px] text-muted-foreground">Найдите задачу, которая подходит именно вам</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Поиск по названию, технологии..."
                className="w-full h-[44px] pl-10 pr-4 rounded-[14px] bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(0); }}
              className="h-[44px] px-4 pr-8 rounded-[14px] bg-card border border-border text-[14px] text-muted-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={format}
              onChange={(e) => { setFormat(e.target.value); setPage(0); }}
              className="h-[44px] px-4 pr-8 rounded-[14px] bg-card border border-border text-[14px] text-muted-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat cursor-pointer"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-6 py-3">
            <span className="text-[14px] text-muted-foreground">
              {isLoading ? (
                "Загрузка..."
              ) : (
                <>Найдено <strong className="text-foreground">{tasks.length}</strong> задач</>
              )}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">Сортировка:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-[36px] px-3 pr-8 rounded-[10px] bg-card border border-border text-[13px] text-foreground outline-none focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3a0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat cursor-pointer"
              >
                <option value="newest">Новые</option>
                <option value="deadline">Ближайший срок</option>
                <option value="popular">Популярные</option>
              </select>
            </div>
          </div>

          {/* Tasks Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-[15px] text-muted-foreground">Загрузка задач...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Search size={40} strokeWidth={1.5} className="text-muted-foreground mb-4" />
              <h3 className="text-[18px] font-semibold text-foreground mb-2">Задачи не найдены</h3>
              <p className="text-muted-foreground text-[14px]">Попробуйте изменить фильтры или параметры поиска</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {tasks.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="w-10 h-10 rounded-[12px] border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {[0, 1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-[12px] text-[14px] font-medium transition-colors cursor-pointer ${
                    p === page
                      ? "bg-primary text-white"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {p + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={tasks.length < pageSize}
                className="w-10 h-10 rounded-[12px] border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
