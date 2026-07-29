"use client";

import { LoginForm } from "@features/auth";
import { LogIn, Shield, Target, Clock } from "@shared/ui/Icons";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  { icon: Shield, title: "Подтверждённый опыт", desc: "Реальные задачи от IT-компаний" },
  { icon: Target, title: "Карьерный рост", desc: "От задачи к стажировке или офферу" },
  { icon: Clock, title: "Быстрый старт", desc: "Первая задача за 10 минут" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px]">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors no-underline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            На главную
          </a>
          <div className="mb-8">
            <h1 className="text-[28px] font-bold font-display text-foreground mb-2">Войти</h1>
            <p className="text-sm text-muted-foreground">Продолжите свой путь в IT</p>
          </div>
          <LoginForm />
        </div>
      </div>

      {/* Right: Illustration */}
      <div className="hidden md:flex flex-1 bg-primary/5 p-10 items-center justify-center">
        <div className="max-w-[320px]">
          <div className="w-14 h-14 rounded-[16px] bg-primary text-primary-foreground flex items-center justify-center mb-6">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold font-display text-primary mb-3">
            Добро пожаловать
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Выполняйте реальные задачи IT-компаний, подтверждайте навыки и получайте возможность перейти к стажировке или работе.
          </p>
          <div className="flex flex-col gap-4">
            {benefits.map((ben) => {
              const Icon = ben.icon;
              return (
                <Card key={ben.title}>
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{ben.title}</div>
                      <div className="text-xs text-muted-foreground">{ben.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
