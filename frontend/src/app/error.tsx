"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-[20px] bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-[28px] font-bold font-display text-foreground mb-3">
          Что-то пошло не так
        </h1>
        <p className="text-[15px] text-muted-foreground mb-8 leading-relaxed">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2 cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-8 rounded-2xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-2 no-underline"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            На главную
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="mt-8 text-[13px] text-muted-foreground">
            Error digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
