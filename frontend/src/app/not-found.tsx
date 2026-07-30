import Link from "next/link";
import { Search, Home } from "@shared/ui/Icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
          <Search size={28} className="text-muted-foreground" />
        </div>
        <h1 className="text-[64px] font-bold font-display text-foreground leading-none mb-2">404</h1>
        <p className="text-[14px] text-muted-foreground mb-6">
          Страница не найдена
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[14px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[14px] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] no-underline"
        >
          <Home size={16} />
          На главную
        </Link>
      </div>
    </div>
  );
}
