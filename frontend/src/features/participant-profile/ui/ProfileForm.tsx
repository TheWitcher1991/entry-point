"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@entities/participant";
import type { ParticipantProfile } from "@entities/participant";
import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";
import { Check } from "@shared/ui/Icons";

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  specialty: z.string().optional(),
  graduation_year: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
  desired_role: z.string().optional(),
  github_url: z.string().url("Некорректная ссылка").optional().or(z.literal("")),
  telegram: z.string().optional(),
  portfolio_url: z.string().url("Некорректная ссылка").optional().or(z.literal("")),
  resume_url: z.string().url("Некорректная ссылка").optional().or(z.literal("")),
  availability_status: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const availabilityOptions = [
  { value: "active", label: "Активно ищу" },
  { value: "passive", label: "Рассматриваю предложения" },
  { value: "not_looking", label: "Не ищу" },
];

function SectionHeader({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-5 rounded-full bg-primary" />
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
  );
}

export function ParticipantProfileForm() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading, isError } = useQuery<ParticipantProfile>({
    queryKey: ["participant-profile"],
    queryFn: getProfile,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        city: profile.city ?? "",
        bio: profile.bio ?? "",
        education: profile.education ?? "",
        specialty: profile.specialty ?? "",
        graduation_year: profile.graduation_year ?? undefined,
        desired_role: profile.desired_role ?? "",
        github_url: profile.github_url ?? "",
        telegram: profile.telegram ?? "",
        portfolio_url: profile.portfolio_url ?? "",
        resume_url: profile.resume_url ?? "",
        availability_status: profile.availability_status ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participant-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    setSaved(false);
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground text-[15px]">
        Загрузка профиля...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-12 text-center text-destructive text-[15px]">
        Ошибка загрузки профиля
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {/* ── Основное ── */}
      <div>
        <SectionHeader>Основное</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Input label="Имя" placeholder="Иван" {...register("first_name")} />
          </div>
          <div>
            <Input label="Фамилия" placeholder="Иванов" {...register("last_name")} />
          </div>
          <div>
            <Input label="Город" placeholder="Москва" {...register("city")} />
          </div>
          <div>
            <Input
              label="Желаемая роль"
              placeholder="Frontend-разработчик"
              {...register("desired_role")}
            />
          </div>
        </div>
      </div>

      {/* ── О себе ── */}
      <div>
        <SectionHeader>О себе</SectionHeader>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Bio</span>
            <textarea
              className="h-[120px] px-4 py-3 rounded-[16px] border border-border bg-card text-[16px] text-foreground outline-none transition-colors focus:border-primary resize-vertical"
              placeholder="Расскажите о себе, своих навыках и опыте"
              {...register("bio")}
            />
          </label>

          <label className="flex flex-col gap-1.5 max-w-[280px]">
            <span className="text-sm text-muted-foreground">Статус поиска</span>
            <select
              className="h-[52px] px-4 rounded-[16px] border border-border bg-card text-[16px] text-foreground outline-none transition-colors focus:border-primary"
              {...register("availability_status")}
            >
              <option value="">Не указан</option>
              {availabilityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Образование ── */}
      <div>
        <SectionHeader>Образование</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Input
              label="Образование"
              placeholder="МГУ, ВШЭ, etc."
              {...register("education")}
            />
          </div>
          <div>
            <Input
              label="Специальность"
              placeholder="Прикладная математика"
              {...register("specialty")}
            />
          </div>
          <div className="max-w-[200px]">
            <Input
              label="Год выпуска"
              type="number"
              placeholder="2024"
              {...register("graduation_year")}
            />
            {errors.graduation_year && (
              <span className="text-[#e74c3c] text-[13px]">
                {errors.graduation_year.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Ссылки ── */}
      <div>
        <SectionHeader>Ссылки</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Input
              label="GitHub"
              placeholder="https://github.com/username"
              {...register("github_url")}
            />
            {errors.github_url && (
              <span className="text-[#e74c3c] text-[13px]">
                {errors.github_url.message}
              </span>
            )}
          </div>
          <div>
            <Input
              label="Telegram"
              placeholder="@username"
              {...register("telegram")}
            />
          </div>
          <div>
            <Input
              label="Портфолио"
              placeholder="https://..."
              {...register("portfolio_url")}
            />
            {errors.portfolio_url && (
              <span className="text-[#e74c3c] text-[13px]">
                {errors.portfolio_url.message}
              </span>
            )}
          </div>
          <div>
            <Input
              label="Резюме"
              placeholder="https://..."
              {...register("resume_url")}
            />
            {errors.resume_url && (
              <span className="text-[#e74c3c] text-[13px]">
                {errors.resume_url.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <Button type="submit" disabled={mutation.isPending} variant="primary">
          {mutation.isPending ? "Сохранение..." : "Сохранить"}
        </Button>

        {saved && (
          <span className="text-sm text-primary font-medium"><Check size={14} className="inline mr-1" /> Сохранено</span>
        )}

        {mutation.isError && (
          <span className="text-sm text-destructive">
            Ошибка сохранения. Попробуйте снова.
          </span>
        )}
      </div>
    </form>
  );
}
