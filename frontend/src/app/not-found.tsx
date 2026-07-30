import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-[20px] bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-[64px] font-bold font-display text-foreground leading-none mb-2">404</h1>
        <p className="text-[18px] text-muted-foreground mb-8">
          Страница не найдена
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-2xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2 no-underline"
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
    </div>
  );
}
