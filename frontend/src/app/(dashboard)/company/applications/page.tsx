"use client";

import Link from "next/link";
import { useUnit } from "effector-react";
import { $user } from "@features/auth";
import { Header } from "@widgets/header";
import { ApplicationReviewList } from "@features/application-review";

export default function CompanyApplicationsPage() {
  const user = useUnit($user);
  const companyName = user?.company_name || "Компания";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold font-display text-foreground">Заявки</h1>
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
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary -mb-px flex items-center gap-2">
            Заявки
          </span>
          <Link
            href="/company/submissions"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent -mb-px hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Результаты
          </Link>
          <Link
            href="/company/participants"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent -mb-px hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Участники
          </Link>
        </div>

        <ApplicationReviewList />
      </div>
    </div>
  );
}
