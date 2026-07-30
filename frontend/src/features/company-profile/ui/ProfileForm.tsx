"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompany, updateCompany } from "@entities/company";
import type { Company } from "@entities/company";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@shared/ui/Button";
import { Input } from "@shared/ui/Input";
import { Check } from "@shared/ui/Icons";

const profileSchema = z.object({
  name: z.string().optional(),
  city: z.string().optional(),
  website: z.string().url("Некорректная ссылка").optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  company_size: z.string().optional(),
  stack: z.string().optional(),
  contact_name: z.string().optional(),
  contact_position: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const companySizeOptions = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-1000", label: "201–1000" },
  { value: "1000+", label: "1000+" },
];

function SectionHeader({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-5 rounded-full bg-primary" />
      <h2 className="text-lg font-semibold">{children}</h2>
    </div>
  );
}

export function CompanyProfileForm() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: company, isLoading, isError } = useQuery<Company>({
    queryKey: ["company-profile"],
    queryFn: getCompany,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name ?? "",
        city: company.city ?? "",
        website: company.website ?? "",
        description: company.description ?? "",
        industry: company.industry ?? "",
        company_size: company.company_size ?? "",
        stack: company.stack ?? "",
        contact_name: company.contact_name ?? "",
        contact_position: company.contact_position ?? "",
      });
    }
  }, [company, reset]);

  const mutation = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
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
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Skeleton className="h-[52px] rounded-[16px]" />
            <Skeleton className="h-[52px] rounded-[16px]" />
            <Skeleton className="h-[52px] rounded-[16px]" />
            <Skeleton className="h-[52px] rounded-[16px]" />
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-20 mb-4" />
          <Skeleton className="h-[120px] rounded-[16px] mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Skeleton className="h-[52px] rounded-[16px]" />
            <Skeleton className="h-[52px] rounded-[16px]" />
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Skeleton className="h-[52px] rounded-[16px]" />
            <Skeleton className="h-[52px] rounded-[16px]" />
          </div>
        </div>
        <Skeleton className="h-12 w-32 rounded-[16px]" />
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
            <Input label="Название компании" placeholder="ООО «...»" {...register("name")} />
          </div>
          <div>
            <Input label="Город" placeholder="Москва" {...register("city")} />
          </div>
          <div>
            <Input
              label="Сайт"
              placeholder="https://example.com"
              {...register("website")}
            />
            {errors.website && (
              <span className="text-[#e74c3c] text-[13px]">
                {errors.website.message}
              </span>
            )}
          </div>
          <div>
            <Input label="Индустрия" placeholder="IT, FinTech, EdTech..." {...register("industry")} />
          </div>
        </div>
      </div>

      {/* ── Описание ── */}
      <div>
        <SectionHeader>Описание</SectionHeader>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">О компании</span>
            <textarea
              className="h-[120px] px-4 py-3 rounded-[16px] border border-border bg-card text-[16px] text-foreground outline-none transition-colors focus:border-primary resize-vertical"
              placeholder="Расскажите о компании, миссии, проектах"
              {...register("description")}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Размер компании</span>
              <select
                className="h-[52px] px-4 rounded-[16px] border border-border bg-card text-[16px] text-foreground outline-none transition-colors focus:border-primary"
                {...register("company_size")}
              >
                <option value="">Не указан</option>
                {companySizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Технологический стек</span>
              <textarea
                className="h-[52px] px-4 py-3 rounded-[16px] border border-border bg-card text-[16px] text-foreground outline-none transition-colors focus:border-primary resize-none"
                placeholder="Python, React, Go, ..."
                {...register("stack")}
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── Контакты ── */}
      <div>
        <SectionHeader>Контакты</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Input
              label="Контактное лицо"
              placeholder="Иван Иванов"
              {...register("contact_name")}
            />
          </div>
          <div>
            <Input
              label="Должность"
              placeholder="HR-менеджер"
              {...register("contact_position")}
            />
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
