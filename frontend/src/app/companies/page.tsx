"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@entities/company";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Search,
  MapPin,
  CheckVerified,
  Building,
  TrendingUp,
} from "@shared/ui/Icons";

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

function getCompanyColor(index: number): string {
  return LIGHT_BG_COLORS[index % LIGHT_BG_COLORS.length];
}

export default function CompaniesPage() {
  const [searchInput, setSearchInput] = useState("");

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies", searchInput],
    queryFn: () =>
      getCompanies({
        search: searchInput.trim() || undefined,
        limit: 50,
      }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
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

            {!isLoading && companies.length > 0 && (
              <div className="flex items-center gap-6 text-[14px] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building strokeWidth={1.5} size={18} className="text-primary" />
                  <span className="text-foreground font-semibold">{companies.length}</span>
                  компаний
                </span>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по названию, городу, технологиям..."
              className="w-full h-[52px] pl-[44px] pr-4 bg-card border border-border rounded-2xl text-[15px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-card border border-border animate-pulse"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-[16px] bg-muted/70 shrink-0" />
                    <div className="flex-1">
                      <div className="h-5 w-2/3 bg-muted/70 rounded-[8px] mb-2" />
                      <div className="h-4 w-1/3 bg-muted/50 rounded-[6px]" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted/50 rounded-[6px] mb-2" />
                  <div className="h-4 w-3/4 bg-muted/50 rounded-[6px] mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted/50 rounded-[10px]" />
                    <div className="h-6 w-20 bg-muted/50 rounded-[10px]" />
                    <div className="h-6 w-14 bg-muted/50 rounded-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20">
              <Building size={40} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-[18px] font-semibold text-foreground mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {companies.map((company, index) => {
                const initial = company.name?.[0] || "?";
                const bgColor = getCompanyColor(index);
                const stackTags = company.stack
                  ? company.stack.split(",").map((s) => s.trim())
                  : [];

                return (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="group p-6 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline block active:scale-[0.96]"
                  >
                    {/* Top row: Logo + Name + Verified */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-[26px] font-bold shrink-0 ${bgColor}`}>
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[18px] font-bold font-display text-foreground group-hover:text-primary transition-colors truncate">
                            {company.name || "Неизвестная компания"}
                          </h3>
                          {company.verification_status === "verified" && (
                            <span className="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[11px] font-medium">
                              <CheckVerified size={12} strokeWidth={2.5} />
                              Верифицирована
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                          {company.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} strokeWidth={1.5} />
                              {company.city}
                            </span>
                          )}
                          {company.company_size && (
                            <span>{company.company_size}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Tags */}
                    {stackTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {stackTags.slice(0, 4).map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-1 rounded-xl bg-muted text-muted-foreground text-[12px] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {stackTags.length > 4 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-muted text-muted-foreground text-[12px] font-medium">
                            +{stackTags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground ml-auto">
                        <TrendingUp size={14} strokeWidth={1.5} className="text-primary" />
                        Подробнее
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
