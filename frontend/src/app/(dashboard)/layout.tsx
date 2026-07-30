"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUnit } from "effector-react";
import {
  $user,
  $isHydrated,
} from "@features/auth";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = useUnit($user);
  const isHydrated = useUnit($isHydrated);
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated after hydration
  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
      return;
    }

    // Role mismatch safety check
    if (isHydrated && user) {
      const isCompanyPath = pathname.startsWith("/company");
      const isParticipantPath = pathname.startsWith("/participant");

      if (user.role === "company" && isParticipantPath) {
        router.replace("/company");
      } else if (user.role === "participant" && isCompanyPath) {
        router.replace("/participant");
      }
    }
  }, [isHydrated, user, pathname, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-[10px]" />
            <Skeleton className="h-9 w-24 rounded-[10px]" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[1200px] mx-auto">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-10 w-96 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-8 rounded-3xl bg-card border border-border">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-5" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Just render children — the pages control their own layout structure
  return <>{children}</>;
}
