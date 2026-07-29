import type { ReactNode } from "react";
import { Header } from "@widgets/header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center items-center p-6">
        {children}
      </div>
    </div>
  );
}
