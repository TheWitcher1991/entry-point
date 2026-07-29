import Link from "next/link";
import { RegisterForm } from "@features/auth";
import { UserPlus, Clock, Shield, Star } from "@shared/ui/Icons";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[28px] bg-card border border-border overflow-hidden min-h-[600px]">
      {/* Form Panel */}
      <div className="p-8 md:p-10 flex items-center">
        <div className="w-full max-w-[380px] mx-auto">
          <h1 className="text-[28px] font-bold font-display text-foreground mb-2">
            Создайте аккаунт
          </h1>
          <p className="text-[15px] text-muted-foreground mb-8">
            Выберите роль и заполните данные для регистрации
          </p>

          <RegisterForm />

          <p className="text-center text-[14px] text-muted-foreground mt-6">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary font-medium no-underline hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>

      {/* Illustration Panel */}
      <div className="hidden md:flex bg-primary/5 p-10 items-center justify-center">
        <div className="max-w-[320px]">
          <div className="w-14 h-14 rounded-[16px] bg-primary text-white flex items-center justify-center mb-6">
            <UserPlus size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-[24px] font-bold font-display text-primary mb-3">
            Присоединяйтесь
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8">
            Более 890 участников уже используют «Точку входа» для карьерного старта в IT.
          </p>

          <div className="flex flex-col gap-5">
            {[
              { icon: Clock, title: "Быстрая регистрация", desc: "Создайте аккаунт за 2 минуты" },
              { icon: Shield, title: "Безопасно", desc: "Ваши данные защищены" },
              { icon: Star, title: "Бесплатно", desc: "Платформа бесплатна для участников" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">{item.title}</div>
                    <div className="text-[13px] text-muted-foreground">{item.desc}</div>
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
