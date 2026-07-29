"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUnit } from "effector-react";
import {
  $user,
  $isHydrated,
} from "@features/auth";
import type { ReactNode } from "react";

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
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-[15px]">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Just render children — the pages control their own layout structure
  return <>{children}</>;
}
