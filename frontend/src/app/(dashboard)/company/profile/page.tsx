"use client";

import { CompanyProfileForm } from "@features/company-profile";
import { Header } from "@widgets/header";

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 pt-10 pb-8">
        <h1 className="text-[28px] font-bold font-display text-foreground mb-2">Профиль компании</h1>
        <p className="text-[15px] text-muted-foreground mb-8">
          Расскажите о вашей компании, чтобы участники могли вас найти
        </p>

        <div className="rounded-[24px] bg-card border border-border p-6 sm:p-8">
          <CompanyProfileForm />
        </div>
      </div>
    </div>
  );
}
