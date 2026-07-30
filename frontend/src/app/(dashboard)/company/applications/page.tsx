"use client";

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

        <ApplicationReviewList />
      </div>
    </div>
  );
}
