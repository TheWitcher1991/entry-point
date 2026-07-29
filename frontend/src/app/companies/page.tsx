"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { Search, MapPin, CheckVerified, Star, Briefcase, Building, TrendingUp, Users } from "@shared/ui/Icons";

const companies = [
  {
    id: "verba-tech",
    name: "Verba Tech",
    initial: "V",
    bg: "bg-[#E8F4F4] text-[#166666] dark:bg-[#166666]/20 dark:text-[#2EC4B6]",
    city: "Москва",
    description: "SaaS-платформа для автоматизации бизнес-процессов. Разрабатываем инструменты, которые помогают малому и среднему бизнесу оптимизировать рутинные процессы.",
    tags: ["SaaS", "Автоматизация", "B2B", "Node.js", "React", "PostgreSQL"],
    verified: true,
    stats: { tasks: 3, participants: 12, rating: 4.8 },
  },
  {
    id: "dataflow",
    name: "DataFlow",
    initial: "D",
    bg: "bg-[#FFF3E0] text-[#E65100] dark:bg-[#E65100]/20 dark:text-[#FFB74D]",
    city: "Санкт-Петербург",
    description: "Аналитическая платформа для обработки больших данных. Строим инфраструктуру для data-driven решений в ритейле и финтехе.",
    tags: ["Big Data", "Python", "ML", "Spark", "Kafka"],
    verified: true,
    stats: { tasks: 5, participants: 18, rating: 4.6 },
  },
  {
    id: "codebridge",
    name: "CodeBridge",
    initial: "C",
    bg: "bg-[#E3F2FD] text-[#0D47A1] dark:bg-[#0D47A1]/20 dark:text-[#64B5F6]",
    city: "Москва",
    description: "Платформа для совместной разработки и code review. Помогаем командам выстраивать эффективный CI/CD и поддерживать качество кода.",
    tags: ["DevTools", "CI/CD", "TypeScript", "Docker", "Kubernetes"],
    verified: false,
    stats: { tasks: 2, participants: 5, rating: 4.2 },
  },
  {
    id: "neotech",
    name: "NeoTech Solutions",
    initial: "N",
    bg: "bg-[#F3E5F5] text-[#4A148C] dark:bg-[#4A148C]/20 dark:text-[#CE93D8]",
    city: "Казань",
    description: "Разработка мобильных и веб-приложений на Flutter и React Native. Специализируемся на финтех-продуктах и маркетплейсах.",
    tags: ["Mobile", "Flutter", "React Native", "Fintech"],
    verified: true,
    stats: { tasks: 7, participants: 24, rating: 4.9 },
  },
  {
    id: "greensoft",
    name: "GreenSoft",
    initial: "G",
    bg: "bg-[#E8F5E9] text-[#1B5E20] dark:bg-[#1B5E20]/20 dark:text-[#81C784]",
    city: "Екатеринбург",
    description: "Эко-технологии и IoT-решения для умных городов. Создаём аппаратно-программные комплексы для мониторинга окружающей среды.",
    tags: ["IoT", "Embedded", "C++", "Python", "LoRaWAN"],
    verified: false,
    stats: { tasks: 4, participants: 9, rating: 4.4 },
  },
  {
    id: "webcraft",
    name: "WebCraft Studio",
    initial: "W",
    bg: "bg-[#FBE9E7] text-[#BF360C] dark:bg-[#BF360C]/20 dark:text-[#FF8A65]",
    city: "Новосибирск",
    description: "Веб-студия полного цикла. Разрабатываем интернет-магазины, корпоративные порталы и SPA на React/Vue с акцентом на UX/UI.",
    tags: ["React", "Vue", "Node.js", "Design", "E-commerce"],
    verified: true,
    stats: { tasks: 6, participants: 15, rating: 4.7 },
  },
];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = companies.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-[40px] font-bold font-display text-foreground mb-3">
                Компании
              </h1>
              <p className="text-[18px] text-muted-foreground max-w-[560px]">
                IT-компании, которые ищут талантливых специалистов через реальные проекты
              </p>
            </div>

            <div className="flex items-center gap-6 text-[14px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Building strokeWidth={1.5} size={18} className="text-primary" />
                <span className="text-foreground font-semibold">{companies.length}</span>
                компаний
              </span>
              <span className="flex items-center gap-2">
                <Briefcase strokeWidth={1.5} size={18} className="text-primary" />
                <span className="text-foreground font-semibold">
                  {companies.reduce((s, c) => s + c.stats.tasks, 0)}
                </span>
                задач
              </span>
              <span className="flex items-center gap-2">
                <Users strokeWidth={1.5} size={18} className="text-primary" />
                <span className="text-foreground font-semibold">
                  {companies.reduce((s, c) => s + c.stats.participants, 0)}
                </span>
                участников
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, городу, технологиям..."
              className="w-full h-[52px] pl-[44px] pr-4 bg-card border border-border rounded-2xl text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building size={40} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-[18px] font-semibold text-foreground mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="group p-6 rounded-[24px] bg-card border border-border hover:border-muted-foreground/20 hover:shadow-md transition-all no-underline block active:scale-[0.98]"
                  style={{ transitionProperty: "scale, border-color, box-shadow" }}
                >
                  {/* Top row: Logo + Name + Verified */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-[26px] font-bold shrink-0 ${company.bg}`}>
                      {company.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[18px] font-bold font-display text-foreground group-hover:text-primary transition-colors truncate">
                          {company.name}
                        </h3>
                        {company.verified && (
                          <span className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[11px] font-medium">
                            <CheckVerified size={12} strokeWidth={2.5} />
                            Верифицирована
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} strokeWidth={1.5} />
                          {company.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={14} strokeWidth={1.5} className="text-amber-500" />
                          {company.stats.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {company.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {company.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {company.tags.length > 4 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
                        +{company.tags.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Briefcase size={14} strokeWidth={1.5} />
                      <span className="font-medium text-foreground">{company.stats.tasks}</span>
                      задач
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <Users size={14} strokeWidth={1.5} />
                      <span className="font-medium text-foreground">{company.stats.participants}</span>
                      участников
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground ml-auto">
                      <TrendingUp size={14} strokeWidth={1.5} className="text-primary" />
                      Подробнее
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
