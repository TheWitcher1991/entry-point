"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { tokenHydrated } from "@features/auth";

function AuthInit() {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    tokenHydrated(token);
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit />
      {children}
    </QueryClientProvider>
  );
}
