"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";
import { registerFx, $user, $authError, resetAuthError } from "../model";
import { useUnit } from "effector-react";
import { User, Briefcase } from "@shared/ui/Icons";

const registerSchema = z.object({
  firstName: z.string().min(1, "Введите имя"),
  lastName: z.string().min(1, "Введите фамилию"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "Необходимо принять соглашение" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;
type RoleOption = "participant" | "company";

const roleOptions: { value: RoleOption; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "participant",
    label: "Участник",
    desc: "Ищу задачи",
    icon: <User size={20} />,
  },
  {
    value: "company",
    label: "Компания",
    desc: "Публикую задачи",
    icon: <Briefcase size={20} />,
  },
];

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>("participant");
  const pending = useUnit(registerFx.pending);
  const authError = useUnit($authError);
  const user = useUnit($user);
  const submittedRef = useRef(false);

  // Redirect on successful auth
  useEffect(() => {
    if (submittedRef.current && user) {
      router.push(user.role === "company" ? "/company" : "/participant");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreement: false as unknown as true },
  });

  const onSubmit = async (data: RegisterFormData) => {
    resetAuthError();
    submittedRef.current = true;
    await registerFx({
      email: data.email,
      password: data.password,
      role,
      firstName: data.firstName,
      lastName: data.lastName,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        {roleOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            className={`p-4 rounded-[16px] border-2 text-center cursor-pointer transition-[border-color,background-color] duration-150 ease-out ${
              role === opt.value
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className={`w-10 h-10 rounded-[12px] mx-auto mb-2 flex items-center justify-center ${
              role === opt.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {opt.icon}
            </div>
            <div className={`text-[14px] font-semibold ${
              role === opt.value ? "text-primary" : "text-foreground"
            }`}>
              {opt.label}
            </div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              {opt.desc}
            </div>
          </button>
        ))}
      </div>

      {/* First + Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            label="Имя"
            type="text"
            placeholder="Иван"
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className="text-destructive text-[13px] mt-1 block">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div>
          <Input
            label="Фамилия"
            type="text"
            placeholder="Иванов"
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className="text-destructive text-[13px] mt-1 block">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-destructive text-[13px] mt-1 block">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <Input
          label="Пароль"
          type="password"
          placeholder="Минимум 8 символов"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-destructive text-[13px] mt-1 block">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <Input
          label="Повторите пароль"
          type="password"
          placeholder="Повторите пароль"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span className="text-destructive text-[13px] mt-1 block">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("agreement")}
          className="mt-0.5 w-4 h-4 rounded-[4px] accent-primary"
        />
        <span className="text-[13px] text-muted-foreground leading-relaxed">
          Я согласен с <a href="/how-it-works" className="text-primary no-underline hover:underline">пользовательским соглашением</a> и{" "}
          <a href="/how-it-works" className="text-primary no-underline hover:underline">политикой конфиденциальности</a>
        </span>
      </label>
      {errors.agreement && (
        <span className="text-destructive text-[13px] -mt-3 block">
          {errors.agreement.message}
        </span>
      )}

      {authError && (
        <div className="px-4 py-3 rounded-[16px] bg-destructive/10 text-destructive text-sm">
          {authError}
        </div>
      )}

      <Button type="submit" disabled={pending} variant="primary" className="w-full">
        {pending ? "Регистрация..." : "Создать аккаунт"}
      </Button>
    </form>
  );
}
