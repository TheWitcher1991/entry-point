"use client";

import Link from "next/link";
import { Header } from "@widgets/header";
import { ApplicationReviewList } from "@features/application-review";
import { ArrowLeft } from "@shared/ui/Icons";
import { useRouter } from "next/navigation";

export default function CompanyApplicationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 pt-10 pb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} />
          Назад
        </button>

        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">
          Заявки
        </h1>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          <Link
            href="/company/tasks"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Мои задачи
          </Link>
          <span className="px-4 py-3 text-[14px] font-medium text-foreground border-b-2 border-primary flex items-center gap-2">
            Заявки
          </span>
          <Link
            href="/company/submissions"
            className="px-4 py-3 text-[14px] font-medium text-muted-foreground border-b-2 border-transparent hover:text-foreground hover:border-muted-foreground/20 flex items-center gap-2 bg-transparent no-underline transition-colors"
          >
            Результаты
          </Link>
        </div>

        <ApplicationReviewList />
      </div>
    </div>
  );
}
