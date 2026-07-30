import type { FC } from "react";
import Link from "next/link";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { Check, Shield, Target, Users, Clock, DollarSign, FileText, User, Settings, Star, TrendingUp, Briefcase, ArrowRight, Layers, Award } from "@shared/ui/Icons";

const participantSteps = [
  {
    number: 1,
    title: "Создайте профиль",
    desc: "Зарегистрируйтесь и заполните профиль. Укажите навыки, технологии, город и желаемую роль. Подключите GitHub и добавьте портфолио — это поможет компаниям оценить ваш уровень.",
    cards: [
      { icon: User, title: "Личные данные", desc: "Имя, город, фото" },
      { icon: Settings, title: "Навыки", desc: "Технологии и уровень" },
      { icon: Briefcase, title: "Портфолио", desc: "GitHub, проекты" },
    ],
  },
  {
    number: 2,
    title: "Найдите задачу",
    desc: "Откройте каталог задач и используйте фильтры: категория, технологии, уровень сложности, сроки. Каждая карточка содержит полное описание, требования и информацию о карьерных результатах.",
    badges: ["Категория", "Технологии", "Сложность", "Срок", "Формат", "Карьерный результат"],
  },
  {
    number: 3,
    title: "Подайте заявку",
    desc: "Напишите сопроводительное сообщение, опишите мотивацию и укажите доступность. Компания рассмотрит заявку и выберет исполнителя. Вы можете отозвать заявку до принятия решения.",
    checks: [
      "Сопроводительное сообщение",
      "Мотивация и опыт",
      "Доступность по времени",
      "Ссылка на похожую работу",
    ],
  },
  {
    number: 4,
    title: "Выполните задачу",
    desc: "После выбора исполнителем вы получаете доступ к рабочему пространству. Общайтесь с компанией, задавайте вопросы, прикрепляйте файлы и ссылки. Отслеживайте прогресс и соблюдайте сроки.",
    columns: [
      {
        title: "В рабочем пространстве",
        items: ["Чат с компанией", "Требования и сроки", "Вложения и ссылки"],
      },
      {
        title: "Отправка результата",
        items: ["Описание выполненного", "Ссылка на репозиторий", "Демо-ссылка"],
      },
    ],
  },
  {
    number: 5,
    title: "Получите результат",
    desc: "После приёмки работы компания подтверждает навыки, оставляет отзыв и рекомендацию. В профиле автоматически создаётся карточка подтверждённого опыта.",
    cards: [
      { icon: Star, title: "Подтверждённый опыт", desc: "Запись в профиле" },
      { icon: TrendingUp, title: "Отзыв компании", desc: "Оценка и комментарий" },
      { icon: Award, title: "Карьерный рост", desc: "Стажировка или оффер" },
    ],
    accent: true,
  },
];

const companySteps = [
  { number: 1, title: "Зарегистрируйте компанию", desc: "Создайте профиль компании, укажите описание, сайт и контакты. Пройдите модерацию — это занимает один рабочий день." },
  { number: 2, title: "Опубликуйте задачу", desc: "Опишите задачу, укажите требования, сроки и карьерные возможности. Задача пройдёт модерацию перед публикацией." },
  { number: 3, title: "Выберите исполнителя", desc: "Изучите заявки, посмотрите профили и портфолио кандидатов. Выберите того, кто лучше всего подходит." },
  { number: 4, title: "Оцените результат", desc: "Получите выполненную работу, подтвердите навыки и оставьте отзыв. Пригласите участника на стажировку или собеседование." },
];

const companyBenefits = [
  { icon: Shield, title: "Безопасно", desc: "Небольшие задачи без доступа к критическим данным" },
  { icon: Users, title: "Проверка в работе", desc: "Оцените кандидата по результату реальной задачи" },
  { icon: Target, title: "Кадровый резерв", desc: "Формируйте базу проверенных специалистов" },
  { icon: Clock, title: "Быстро", desc: "Задачи от 3 до 30 дней. Нет многоэтапного отбора" },
  { icon: DollarSign, title: "Бесплатно", desc: "Публикация задач и поиск исполнителей бесплатно" },
  { icon: FileText, title: "Декомпозиция", desc: "Поможем разбить задачу на подходящий объём" },
];

const faqs = [
  { q: "Платформа бесплатна?", a: "Да. Регистрация, публикация задач и подача заявок бесплатны. Если компания предусматривает оплату, она обсуждается и выплачивается напрямую вне платформы." },
  { q: "Кто отвечает за качество работы?", a: "Компания устанавливает критерии приёмки и проверяет результат. Платформа фиксирует статусы и обеспечивает коммуникацию, но не является заказчиком." },
  { q: "Можно ли отозвать заявку?", a: "Да, до момента принятия решения компанией. После выбора исполнителя участник получает доступ к рабочему пространству." },
  { q: "Что такое подтверждённый опыт?", a: "Запись в профиле участника, подтверждающая выполнение реальной задачи для компании. Включает описание, оценку, подтверждённые навыки и отзыв." },
  { q: "Могу ли я показать результат в портфолио?", a: "Это определяет компания при публикации задачи. Варианты: публичный результат, без исходного кода, в обезличенном виде или по отдельному соглашению." },
];

function StepBadges({ badges }: { badges: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span key={b} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium">
          {b}
        </span>
      ))}
    </div>
  );
}

function StepChecks({ checks }: { checks: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {checks.map((c) => (
        <div key={c} className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-[14px] text-muted-foreground">{c}</span>
        </div>
      ))}
    </div>
  );
}

function StepCardGrid({ cards }: { cards: { icon: FC<{ size?: number }>; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="p-4 rounded-[16px] bg-card border border-border text-center">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Icon size={20} />
            </div>
            <div className="text-[14px] font-semibold text-foreground">{c.title}</div>
            <div className="text-[12px] text-muted-foreground mt-1">{c.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

function StepColumns({ columns }: { columns: { title: string; items: string[] }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {columns.map((col) => (
        <div key={col.title}>
          <h4 className="text-[14px] font-semibold text-foreground mb-3">{col.title}</h4>
          <div className="flex flex-col gap-2">
            {col.items.map((item) => (
              <div key={item} className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <Check size={14} className="text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ───── HERO ───── */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-100px] right-[-60px] w-[300px] h-[300px] rounded-full bg-primary/[0.04] dark:bg-primary/[0.06] blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-40px] w-[250px] h-[250px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.05] blur-3xl" />
        </div>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 mb-5 h-7 px-3 rounded-full border border-primary/20 bg-primary/5 text-primary text-[12px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Пошаговое руководство
          </div>
          <h1 className="text-[40px] md:text-[48px] font-bold font-display text-foreground mb-4 leading-[1.1]">
            Как это работает
          </h1>
          <p className="text-[17px] text-muted-foreground max-w-[600px] mx-auto leading-relaxed">
            Пять шагов от регистрации до подтверждённого опыта и карьерного продолжения
          </p>
        </div>
      </section>

      {/* ───── FOR PARTICIPANTS ───── */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users size={26} strokeWidth={1.5} />
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground">Для участников</h2>
          </div>

          <div className="flex flex-col gap-6">
            {participantSteps.map((step) => (
              <div
                key={step.number}
                className={`p-6 md:p-8 rounded-3xl border ${step.accent ? "border-primary border-2 bg-card" : "border-border bg-card"} hover:shadow-sm transition-shadow`}
              >
                {/* Step header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-bold shrink-0 ${
                    step.accent ? "bg-primary text-white" : "bg-primary/10 text-primary"
                  }`}>
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold font-display text-foreground">{step.title}</h3>
                  </div>
                </div>

                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6 max-w-[720px]">{step.desc}</p>

                {step.cards && <StepCardGrid cards={step.cards} />}
                {step.badges && <StepBadges badges={step.badges} />}
                {step.checks && <StepChecks checks={step.checks} />}
                {step.columns && <StepColumns columns={step.columns} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ───── FOR COMPANIES ───── */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Briefcase size={26} strokeWidth={1.5} />
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground">Для компаний</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {companySteps.map((step) => (
              <div key={step.number} className="p-6 md:p-8 rounded-3xl bg-card border border-border hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-display text-lg font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-[20px] font-bold font-display text-foreground mb-3">{step.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <h3 className="text-[26px] md:text-[30px] font-bold font-display text-foreground">Преимущества для компаний</h3>
              <p className="text-muted-foreground mt-2">Почему компании выбирают платформу</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {companyBenefits.map((ben) => {
                const Icon = ben.icon;
                return (
                  <div key={ben.title} className="p-6 rounded-3xl bg-card border border-border hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <div className="font-semibold text-[15px] text-foreground mb-1">{ben.title}</div>
                    <div className="text-[13px] text-muted-foreground leading-relaxed">{ben.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[28px] md:text-[32px] font-bold font-display text-foreground">Частые вопросы</h2>
            <p className="text-muted-foreground mt-2">Всё, что вы хотели знать о платформе</p>
          </div>
          <div className="max-w-[720px] mx-auto flex flex-col gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 md:p-8 rounded-3xl bg-card border border-border">
                <h4 className="font-semibold text-[15px] text-foreground mb-2">{faq.q}</h4>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-center overflow-hidden">
            <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-primary-foreground/[0.06] blur-2xl" />
            <div className="absolute bottom-[-80px] left-[-40px] w-[250px] h-[250px] rounded-full bg-primary-foreground/[0.04] blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 mb-5 px-3 h-6 rounded-full bg-primary-foreground/10 text-primary-foreground/80 text-[12px] font-medium border border-primary-foreground/10">
                Совершенно бесплатно
              </div>
              <h2 className="text-[28px] md:text-[36px] font-bold font-display mb-4 leading-[1.1]">Готовы начать?</h2>
              <p className="text-[15px] md:text-[16px] text-primary-foreground/80 max-w-[480px] mx-auto mb-8 leading-relaxed">
                Создайте аккаунт и найдите первую задачу уже сегодня
              </p>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl bg-primary-foreground text-primary text-[14px] md:text-[15px] font-semibold hover:opacity-90 transition-[scale,opacity] duration-150 ease-out active:scale-[0.96] gap-2 no-underline"
                >
                  Зарегистрироваться
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center h-12 md:h-13 px-7 md:px-8 rounded-2xl border-2 border-primary-foreground/20 text-primary-foreground text-[14px] md:text-[15px] font-medium hover:bg-primary-foreground/10 transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] gap-3 no-underline"
                >
                  <Layers size={16} strokeWidth={2} />
                  Смотреть задачи
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
