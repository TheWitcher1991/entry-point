"use client";

import Link from "next/link";
import { Header } from "@widgets/header";
import { ParticipantProfileForm } from "@features/participant-profile";
import { ArrowLeft } from "@shared/ui/Icons";

export default function ParticipantProfileEditPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        {/* Back link */}
        <Link
          href="/participant/profile"
          className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors no-underline mb-6"
        >
          <ArrowLeft size={16} />
          Вернуться в профиль
        </Link>

        <h1 className="text-[28px] font-bold font-display text-foreground mb-8">Редактировать профиль</h1>

        <div className="rounded-[24px] bg-card border border-border p-6 sm:p-8">
          <ParticipantProfileForm />
        </div>
      </div>
    </div>
  );
}
