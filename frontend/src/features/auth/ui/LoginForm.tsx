"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUnit } from "effector-react";
import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";
import { loginFx, $user, $authError, resetAuthError } from "../model";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const pending = useUnit(loginFx.pending);
  const authError = useUnit($authError);
  const user = useUnit($user);
  const submittedRef = useRef(false);

  // Redirect on successful auth
  useEffect(() => {
    if (submittedRef.current && user) {
      router.push(user.role === "company" ? "/company/tasks" : "/participant");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    resetAuthError();
    submittedRef.current = true;
    await loginFx(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
          placeholder="Введите пароль"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-destructive text-[13px] mt-1 block">
            {errors.password.message}
          </span>
        )}
      </div>

      {authError && (
        <div className="px-4 py-3 rounded-[16px] bg-destructive/10 text-destructive text-sm">
          {authError}
        </div>
      )}

      <Button type="submit" disabled={pending} variant="primary" className="w-full">
        {pending ? "Вход..." : "Войти"}
      </Button>
    </form>
  );
}
