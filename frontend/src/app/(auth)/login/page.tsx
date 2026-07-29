import Link from "next/link";
import { LoginForm } from "@features/auth";
import { LogIn, Shield, Target, Clock } from "@shared/ui/Icons";

const benefits = [
  { icon: Shield, title: "Подтверждённый опыт", desc: "Реальные задачи от IT-компаний" },
  { icon: Target, title: "Карьерный рост", desc: "От задачи к стажировке или офферу" },
  { icon: Clock, title: "Быстрый старт", desc: "Первая задача за 10 минут" },
];

export default function LoginPage() {
  return (
    <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[28px] bg-card border border-border overflow-hidden min-h-[600px]">
      {/* Form Panel */}
      <div className="p-8 md:p-10 flex items-center">
        <div className="w-full max-w-[380px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            На главную
          </Link>
          <h1 className="text-[28px] font-bold font-display text-foreground mb-2">Войти</h1>
          <p className="text-[15px] text-muted-foreground mb-8">Продолжите свой путь в IT</p>
          <LoginForm />
          <p className="text-center text-[14px] text-muted-foreground mt-6">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary font-medium no-underline hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>

      {/* Illustration Panel */}
      <div className="hidden md:flex bg-primary/5 p-10 items-center justify-center">
        <div className="max-w-[320px]">
          <div className="w-14 h-14 rounded-[16px] bg-primary text-white flex items-center justify-center mb-6">
            <LogIn size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-[24px] font-bold font-display text-primary mb-3">Добро пожаловать</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
            Выполняйте реальные задачи IT-компаний, подтверждайте навыки и получайте возможность перейти к стажировке или работе.
          </p>
          <div className="flex flex-col gap-5">
            {benefits.map((ben) => {
              const Icon = ben.icon;
              return (
                <div key={ben.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">{ben.title}</div>
                    <div className="text-[13px] text-muted-foreground">{ben.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
