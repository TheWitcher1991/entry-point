"use client";

import { ParticipantProfileForm } from "@features/participant-profile";
import { Header } from "@widgets/header";

export default function ParticipantProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8">
        <h1 className="text-[28px] font-bold font-display text-foreground mb-2">Профиль участника</h1>
        <p className="text-[15px] text-muted-foreground mb-8">
          Заполните информацию о себе, чтобы компании могли вас найти
        </p>

        <div className="rounded-[24px] bg-card border border-border p-6 sm:p-8">
          <ParticipantProfileForm />
        </div>
      </div>
    </div>
  );
}
