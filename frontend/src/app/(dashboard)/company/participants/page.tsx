"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getParticipants } from "@entities/participant";
import { Header } from "@widgets/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Briefcase, GraduationCap, ChevronRight } from "@shared/ui/Icons";

export default function CompanyParticipantsPage() {
  const [search, setSearch] = useState("");

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ["participants", search],
    queryFn: () => getParticipants({ search: search || undefined }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-10 pb-8">
        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">
          Участники
        </h1>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <Link
            href="/company/tasks"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Задачи
          </Link>
          <Link
            href="/company/applications"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Заявки
          </Link>
          <Link
            href="/company/submissions"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Результаты
          </Link>
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary flex items-center gap-2">
            Участники
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск участников по имени, специальности..."
            className="w-full h-[52px] pl-12 pr-4 rounded-2xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 rounded-3xl bg-card border border-border">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-[18px] font-semibold text-foreground mb-2">
              {search ? "Ничего не найдено" : "Нет участников"}
            </h3>
            <p className="text-[14px] text-muted-foreground">
              {search ? "Попробуйте изменить поисковый запрос" : "Пока никто не зарегистрировался"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participants.map((p) => (
              <Link
                key={p.id}
                href={`/participants/${p.id}`}
                className="p-5 rounded-3xl bg-card border border-border hover:border-muted-foreground/20 transition-[scale,border-color] no-underline active:scale-[0.96] block group"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    {p.avatar_url ? (
                      <AvatarImage src={p.avatar_url} alt={p.first_name || ""} />
                    ) : null}
                    <AvatarFallback>
                      {p.first_name?.[0] || p.last_name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[15px] text-foreground truncate group-hover:text-primary transition-colors">
                        {p.first_name} {p.last_name}
                      </h3>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                      {p.specialty && (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase size={12} strokeWidth={1.5} />
                          {p.specialty}
                        </span>
                      )}
                      {p.city && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} strokeWidth={1.5} />
                          {p.city}
                        </span>
                      )}
                      {p.education && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap size={12} strokeWidth={1.5} />
                          {p.education}
                        </span>
                      )}
                    </div>

                    {p.bio && (
                      <p className="text-[13px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
