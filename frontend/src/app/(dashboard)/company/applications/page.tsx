"use client";

import { Header } from "@widgets/header";
import { ApplicationReviewList } from "@features/application-review";
import { ArrowLeft } from "@shared/ui/Icons";
import { useRouter } from "next/navigation";

export default function CompanyApplicationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[900px] w-full mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} />
          Назад
        </button>

        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">
          Заявки на задачи
        </h1>

        <ApplicationReviewList />
      </div>
    </div>
  );
}
