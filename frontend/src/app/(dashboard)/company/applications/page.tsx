"use client";

import Link from "next/link";
import { Header } from "@widgets/header";
import { ApplicationReviewList } from "@features/application-review";

export default function CompanyApplicationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">
          Заявки
        </h1>

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
