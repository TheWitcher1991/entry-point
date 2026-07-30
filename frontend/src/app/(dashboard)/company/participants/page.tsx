"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { getParticipants } from "@entities/participant";
import { Header } from "@widgets/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Briefcase, GraduationCap, User, ExternalLink } from "@shared/ui/Icons";

export default function CompanyParticipantsPage() {
  const user = useUnit($user);
  const companyName = user?.company_name || "Компания";
  const [search, setSearch] = useState("");

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ["participants", search],
    queryFn: () => getParticipants({ search: search || undefined }),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold font-display text-foreground">Участники</h1>
          <p className="text-[15px] text-muted-foreground mt-1">{companyName}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <Link
            href="/company/tasks"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent -mb-px hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Задачи
          </Link>
          <Link
            href="/company/applications"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent -mb-px hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Заявки
          </Link>
          <Link
            href="/company/submissions"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent -mb-px hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Результаты
          </Link>
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary -mb-px flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[20px] bg-card border border-border shadow-sm">
                <div className="p-5 pb-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-28 rounded-lg" />
                  </div>
                </div>
                <div className="px-5 pb-3">
                  <Skeleton className="h-3 w-full mb-1.5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="border-t border-border mx-5" />
                <div className="px-5 py-3 flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {participants.map((p) => (
              <Link
                key={p.id}
                href={`/participants/${p.id}`}
                className="rounded-[20px] bg-card border border-border hover:border-primary/30 transition-[scale,border-color,box-shadow] no-underline active:scale-[0.96] block group shadow-sm hover:shadow-md"
              >
                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14">
                      {p.avatar_url ? (
                        <AvatarImage src={p.avatar_url} alt={p.first_name || ""} />
                      ) : null}
                      <AvatarFallback className="text-lg">
                        {p.first_name?.[0] || p.last_name?.[0] || <User size={20} />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-semibold text-[16px] text-foreground group-hover:text-primary transition-colors">
                        {p.first_name} {p.last_name}
                      </h3>
                      {p.specialty && (
                        <p className="text-[13px] text-muted-foreground mt-0.5">
                          {p.specialty}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="px-5 pb-3">
                  <div className="flex flex-wrap gap-3 text-[13px] text-muted-foreground">
                    {p.city && (
                      <span className="inline-flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                        <MapPin size={13} strokeWidth={1.5} />
                        {p.city}
                      </span>
                    )}
                    {p.education && (
                      <span className="inline-flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                        <GraduationCap size={13} strokeWidth={1.5} />
                        {p.education}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {p.bio && (
                  <div className="px-5 pb-3">
                    <p className="text-[13px] text-muted-foreground/80 leading-relaxed line-clamp-2">
                      {p.bio}
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-border mx-5" />

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Briefcase size={12} strokeWidth={1.5} />
                    {p.specialty || "Участник"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Профиль
                    <ExternalLink size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
