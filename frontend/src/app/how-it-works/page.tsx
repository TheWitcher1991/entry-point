import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { Check, Shield, Target, Users, Clock, DollarSign, FileText } from "@shared/ui/Icons";

const participantSteps = [
  {
    number: 1,
    title: "Создайте профиль",
    desc: "Зарегистрируйтесь и заполните профиль. Укажите навыки, технологии, город и желаемую роль. Подключите GitHub и добавьте портфолио — это поможет компаниям оценить ваш уровень.",
    cards: [
      { icon: "👤", title: "Личные данные", desc: "Имя, город, фото" },
      { icon: "🛠", title: "Навыки", desc: "Технологии и уровень" },
      { icon: "💼", title: "Портфолио", desc: "GitHub, проекты" },
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
      { icon: "✅", title: "Подтверждённый опыт", desc: "Запись в профиле" },
      { icon: "⭐", title: "Отзыв компании", desc: "Оценка и комментарий" },
      { icon: "🚀", title: "Карьерный рост", desc: "Стажировка или оффер" },
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
    <div className="flex flex-wrap gap-3">
      {badges.map((b) => (
        <span key={b} className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[13px] font-medium">
          {b}
        </span>
      ))}
    </div>
  );
}

function StepChecks({ checks }: { checks: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
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

function StepCardGrid({ cards }: { cards: { icon: string; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.title} className="p-4 rounded-[16px] bg-muted text-center">
          <div className="text-[28px] mb-2">{c.icon}</div>
          <div className="text-[14px] font-semibold text-foreground">{c.title}</div>
          <div className="text-[12px] text-muted-foreground">{c.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <h1 className="text-[40px] font-bold font-display text-foreground mb-4">
            Как это работает
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-[640px] mx-auto">
            Пять шагов от регистрации до подтверждённого опыта и карьерного продолжения
          </p>
        </div>
      </section>

      {/* For Participants */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-[30px] font-bold font-display text-foreground">Для участников</h2>
          </div>

          {participantSteps.map((step) => (
            <div key={step.number} className="grid grid-cols-[80px_1fr] gap-8 mb-12 items-start">
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl font-bold shrink-0 ${
                  step.accent ? "bg-primary border-2 border-primary text-white" : "bg-primary text-white"
                }`}>
                  {step.number}
                </div>
                {step.number < 5 && <div className="w-[2px] flex-1 bg-border min-h-[40px]" />}
              </div>
              <div className={`p-6 rounded-[24px] border ${step.accent ? "border-primary border-2" : "border-border bg-card"}`}>
                <h3 className="text-[24px] font-bold font-display text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">{step.desc}</p>

                {step.cards && <StepCardGrid cards={step.cards} />}
                {step.badges && <StepBadges badges={step.badges} />}
                {step.checks && <StepChecks checks={step.checks} />}

                {step.columns && (
                  <div className="grid grid-cols-2 gap-6">
                    {step.columns.map((col) => (
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
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* For Companies */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h2 className="text-[30px] font-bold font-display text-foreground">Для компаний</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {companySteps.map((step) => (
              <div key={step.number} className="p-6 rounded-[24px] bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-display text-lg font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-[20px] font-bold font-display text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="mt-14">
            <h3 className="text-[24px] font-bold font-display text-foreground mb-8">Преимущества для компаний</h3>
            <div className="grid grid-cols-3 gap-6">
              {companyBenefits.map((ben) => {
                const Icon = ben.icon;
                return (
                  <div key={ben.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-foreground mb-0.5">{ben.title}</div>
                      <div className="text-[14px] text-muted-foreground leading-relaxed">{ben.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[30px] font-bold font-display text-foreground">Частые вопросы</h2>
          </div>
          <div className="max-w-[720px] mx-auto flex flex-col gap-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="p-6 rounded-[20px] bg-card border border-border">
                <h4 className="font-semibold text-[15px] text-foreground mb-2">{faq.q}</h4>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="p-12 rounded-[24px] bg-primary text-center text-white">
            <h2 className="text-[32px] font-bold font-display mb-4">Готовы начать?</h2>
            <p className="text-[16px] text-white/80 mb-8">Создайте аккаунт и найдите первую задачу уже сегодня</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/register"
                className="inline-flex items-center px-6 py-3 text-[15px] font-semibold text-primary bg-white hover:opacity-90 rounded-[14px] transition-opacity no-underline"
              >
                Зарегистрироваться
              </a>
              <a
                href="/catalog"
                className="inline-flex items-center px-6 py-3 text-[15px] font-semibold text-white border-2 border-white/30 hover:bg-white/10 rounded-[14px] transition-colors no-underline"
              >
                Посмотреть задачи
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
