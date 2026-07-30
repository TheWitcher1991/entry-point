"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUnit } from "effector-react";
import { $user, $isHydrated } from "@features/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCompanies,
  updateCompanyVerification,
} from "@entities/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  ArrowLeft,
  Check,
  X,
  Building,
  Activity,
} from "@shared/ui/Icons";

const VERIFICATION_BADGE: Record<string, string> = {
  verified:
    "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  unverified:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  rejected:
    "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const VERIFICATION_LABELS: Record<string, string> = {
  verified: "Верифицирована",
  unverified: "Не верифицирована",
  rejected: "Отклонена",
};

export default function AdminCompaniesPage() {
  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: getAdminCompanies,
    staleTime: 10_000,
  });

  const mutation = useMutation({
    mutationFn: ({
      companyId,
      status,
    }: {
      companyId: number;
      status: string;
    }) => updateCompanyVerification(companyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setLoadingAction(null);
    },
    onError: () => {
      setLoadingAction(null);
    },
  });

  const handleVerify = (companyId: number, status: string) => {
    const key = `${companyId}-${status}`;
    setLoadingAction(key);
    mutation.mutate({ companyId, status });
  };

  useEffect(() => {
    if (isHydrated && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [isHydrated, user, router]);

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md" />
        <main className="flex-1 max-w-[1200px] mx-auto px-6 py-8 w-full">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-card border border-border"
              >
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-5" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-[12px]" />
                  <Skeleton className="h-9 w-28 rounded-[12px]" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground no-underline mb-6 transition-colors active:scale-[0.96]"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Назад к панели
          </Link>

          <div className="mb-6">
            <h1 className="text-[28px] font-bold font-display text-foreground mb-2">
              Управление компаниями
            </h1>
            <p className="text-[15px] text-muted-foreground">
              Верификация и проверка профилей компаний
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-card border border-border animate-pulse"
                >
                  <div className="h-5 w-1/3 bg-muted/70 rounded-[8px] mb-3" />
                  <div className="h-4 w-1/2 bg-muted/50 rounded-[8px] mb-5" />
                  <div className="flex gap-2">
                    <div className="h-9 w-28 bg-muted/50 rounded-[12px]" />
                    <div className="h-9 w-28 bg-muted/50 rounded-[12px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
                <Building size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-[18px] font-bold font-display text-foreground mb-2">
                Нет компаний
              </h3>
              <p className="text-muted-foreground text-[14px] max-w-sm">
                На платформе пока не зарегистрировано ни одной компании
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {companies.map((company) => {
                const badgeClass =
                  VERIFICATION_BADGE[company.verification_status] ||
                  "bg-muted text-muted-foreground";
                const statusLabel =
                  VERIFICATION_LABELS[company.verification_status] ||
                  company.verification_status;

                return (
                  <div
                    key={company.id}
                    className="p-6 rounded-3xl bg-card border border-border"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[17px] font-semibold text-foreground">
                          {company.name || "Без названия"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeClass}`}
                          >
                            {statusLabel}
                          </span>
                          {company.city && (
                            <span className="text-[13px] text-muted-foreground">
                              {company.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {company.owner_email && (
                      <p className="text-[13px] text-muted-foreground mb-4">
                        Владелец: {company.owner_email}
                      </p>
                    )}

                    {company.description && (
                      <p className="text-[14px] text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-4 border-t border-border flex-wrap">
                      {company.verification_status !== "verified" && (
                        <button
                          onClick={() => handleVerify(company.id, "verified")}
                          disabled={
                            loadingAction === `${company.id}-verified`
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-white bg-primary hover:opacity-90 rounded-[12px] transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {loadingAction === `${company.id}-verified` ? (
                            <Activity size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Верифицировать
                        </button>
                      )}
                      {company.verification_status === "verified" && (
                        <button
                          onClick={() =>
                            handleVerify(company.id, "unverified")
                          }
                          disabled={
                            loadingAction === `${company.id}-unverified`
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Снять верификацию
                        </button>
                      )}
                      {company.verification_status !== "rejected" && (
                        <button
                          onClick={() => handleVerify(company.id, "rejected")}
                          disabled={
                            loadingAction === `${company.id}-rejected`
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 h-9 text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-[12px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <X size={14} />
                          Отклонить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
