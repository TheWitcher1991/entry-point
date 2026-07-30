"use client";

import { useState } from "react";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Check,
  FileText,
  Shield,
} from "@shared/ui/Icons";

interface ContactCardProps {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}

function ContactCard({ icon: Icon, label, value, href }: ContactCardProps) {
  const content = (
    <div className="p-6 rounded-[24px] bg-card border border-border hover:border-primary/30 transition-[scale,border-color] active:scale-[0.96]">
      <div className="w-12 h-12 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon size={22} />
      </div>
      <div className="text-[14px] text-muted-foreground mb-1">{label}</div>
      <div className="text-[16px] font-semibold text-foreground">{value}</div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="no-underline block">
        {content}
      </a>
    );
  }

  return content;
}

export default function ContactsPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Mail size={28} />
          </div>
          <h1 className="text-[40px] font-bold font-display text-foreground mb-4">
            Контакты
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-[640px] mx-auto">
            Свяжитесь с нами — мы всегда рады помочь
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ContactCard
              icon={Mail}
              label="Электронная почта"
              value="hello@tochka-vhoda.ru"
              href="mailto:hello@tochka-vhoda.ru"
            />
            <ContactCard
              icon={MapPin}
              label="Юридический адрес"
              value="с. Надежда, ул. Трудовая, 24/2"
            />
            <ContactCard
              icon={FileText}
              label="ОГРН / ИНН"
              value="1232600016065 / 2623034058"
            />
            <ContactCard
              icon={Clock}
              label="Режим работы"
              value="Пн–Пт, 10:00–19:00"
            />
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-[24px] font-bold font-display text-foreground mb-6">
                Напишите нам
              </h2>

              {submitted ? (
                <div className="p-10 rounded-[24px] bg-card border border-border text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-5">
                    <Check size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[22px] font-bold font-display text-foreground mb-2">
                    Сообщение отправлено!
                  </h3>
                  <p className="text-[15px] text-muted-foreground max-w-[400px] mx-auto">
                    Мы получили ваше сообщение и ответим в течение одного рабочего дня.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="name"
                        className="text-[14px] font-medium text-foreground"
                      >
                        Имя
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Ваше имя"
                        className="h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-[14px] font-medium text-foreground"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="your@email.ru"
                        className="h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="subject"
                      className="text-[14px] font-medium text-foreground"
                    >
                      Тема
                    </label>
                    <select
                      id="subject"
                      required
                      className="h-[52px] px-4 rounded-2xl bg-card border border-border text-[15px] text-foreground outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Выберите тему</option>
                      <option value="question">Вопрос о платформе</option>
                      <option value="moderation">Вопрос о модерации</option>
                      <option value="bug">Сообщить об ошибке</option>
                      <option value="suggestion">Предложение</option>
                      <option value="cooperation">Сотрудничество</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="message"
                      className="text-[14px] font-medium text-foreground"
                    >
                      Сообщение
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      placeholder="Опишите ваш вопрос или предложение..."
                      className="px-4 py-3 rounded-2xl bg-card border border-border text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors resize-y min-h-[140px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 h-[52px] text-[15px] font-semibold text-white bg-primary hover:opacity-90 rounded-[14px] transition-[scale,opacity] active:scale-[0.96] cursor-pointer self-start"
                  >
                    Отправить
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Side info */}
            <div className="lg:col-span-2">
              <div className="p-6 rounded-[24px] bg-muted border border-border mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-[18px] font-bold font-display text-foreground">
                    Юридическая информация
                  </h3>
                </div>

                <div className="flex flex-col gap-3 text-[14px] text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Организация:</span>{' '}
                    ООО «ТалентСпот»
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Юридический адрес:</span>{' '}
                    356220, Ставропольский край, Шпаковский р-н, с. Надежда, ул. Трудовая, д. 24/2
                  </div>
                  <div>
                    <span className="font-medium text-foreground">ИНН / КПП:</span>{' '}
                    2623034058 / 262301001
                  </div>
                  <div>
                    <span className="font-medium text-foreground">ОГРН:</span>{' '}
                    1232600016065
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[24px] bg-muted border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <h3 className="text-[18px] font-bold font-display text-foreground">
                    Реквизиты для связи
                  </h3>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  Для оперативных вопросов используйте форму выше или напишите нам на почту.
                  Отвечаем в течение одного рабочего дня.
                </p>
                <a
                  href="mailto:hello@tochka-vhoda.ru"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:underline no-underline"
                >
                  hello@tochka-vhoda.ru
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
