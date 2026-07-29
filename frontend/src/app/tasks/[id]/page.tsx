import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { ChevronRight, Bookmark, Check, ExternalLink } from "@shared/ui/Icons";

export default function TaskDetailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors no-underline">Главная</a>
            <ChevronRight size={14} className="text-muted-foreground" />
            <a href="/catalog" className="hover:text-primary transition-colors no-underline">Задачи</a>
            <ChevronRight size={14} className="text-muted-foreground" />
            <span className="text-foreground">Telegram-бот для автоматизации заявок</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* LEFT: Task Details */}
            <div>
              {/* Company + Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-[14px] bg-[#E8F4F4] text-primary flex items-center justify-center text-[22px] font-bold shrink-0">
                    V
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] text-foreground">Verba Tech</div>
                    <div className="text-[13px] text-muted-foreground">Стартап · 12 сотрудников · Москва</div>
                  </div>
                </div>
                <span className="inline-flex items-center h-8 px-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[13px] font-medium">
                  Набор открыт
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[32px] font-bold font-display text-foreground leading-tight mb-6">
                Telegram-бот для автоматизации заявок
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {["Node.js", "Telegram Bot API", "PostgreSQL"].map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-[10px] bg-primary/10 text-primary text-[13px] font-medium">
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[13px] font-medium">
                  Разработка
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[13px] font-medium">
                  Средняя сложность
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border mb-8">
                {["Описание", "Требования", "Результат", "Отзывы"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-4 py-3 text-[14px] font-medium -mb-px border-b-2 bg-transparent cursor-pointer ${
                      i === 0
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {tab === "Отзывы" && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold">
                        8
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Description content */}
              <div className="flex flex-col gap-8">
                {/* About */}
                <div>
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">О задаче</h3>
                  <div className="text-muted-foreground leading-relaxed flex flex-col gap-4">
                    <p>
                      Мы ищем разработчика для создания Telegram-бота, который автоматизирует обработку заявок от пользователей. Бот должен принимать сообщения, валидировать данные и отправлять уведомления в нашу внутреннюю CRM-систему через REST API.
                    </p>
                    <p>
                      Бот будет работать в режиме диалога: пользователь описывает задачу, бот задаёт уточняющие вопросы, собирает необходимые данные и формирует заявку. После этого оператор получает уведомление и может начать обработку.
                    </p>
                  </div>
                </div>

                {/* Context */}
                <div>
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Контекст</h3>
                  <div className="text-muted-foreground leading-relaxed">
                    <p>
                      Компания разрабатывает SaaS-платформу для автоматизации бизнес-процессов. Telegram является основным каналом коммуникации с клиентами. В настоящее время обработка заявок ведётся вручную, что занимает много времени и приводит к ошибкам.
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Требования</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      "Node.js (JavaScript или TypeScript)",
                      "Опыт работы с Telegram Bot API",
                      "Знание PostgreSQL или другого SQL",
                      "Понимание REST API",
                      "Базовое понимание Docker (приветствуется)",
                    ].map((req) => (
                      <div key={req} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div>
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Ожидаемый результат</h3>
                  <div className="flex flex-col gap-4 text-muted-foreground">
                    {[
                      "Работающий Telegram-бот с диалоговым интерфейсом",
                      "Интеграция с REST API нашей CRM-системы (документация предоставлена)",
                      "Хранение состояния диалога в PostgreSQL",
                      "Деплой на сервер с помощью Docker",
                      "Документация по установке и настройке",
                    ].map((item, i) => (
                      <div key={item} className="flex gap-3">
                        <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Benefits */}
                <div className="p-6 rounded-[24px] bg-card border border-border">
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Что получает участник</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Подтверждённый опыт",
                      "Отзыв от компании",
                      "Рекомендация",
                      "Кейс для портфолио",
                      "Возможность собеседования",
                      "Возможность стажировки",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-[14px] text-muted-foreground">
                        <Check size={16} className="text-primary shrink-0" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio Policy */}
                <div>
                  <h3 className="text-[20px] font-bold font-display text-foreground mb-4">Политика публикации результата</h3>
                  <div className="text-[14px] text-muted-foreground leading-relaxed">
                    Результат может быть показан в портфолио без исходного кода. Демонстрация в обезличенном виде допустима.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="lg:sticky lg:top-[calc(64px+32px)] flex flex-col gap-6">
              {/* Apply Card */}
              <div className="p-6 rounded-[24px] bg-card border border-border">
                <div className="flex flex-col gap-5">
                  {[
                    { label: "Срок выполнения", value: "14 дней" },
                    { label: "Сложность", value: "Средняя", badge: true },
                    { label: "Мест", value: "3" },
                    { label: "Заявок", value: "12" },
                    { label: "Формат", value: "Удалённый" },
                    { label: "Опубликовано", value: "3 дня назад" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-[14px] text-muted-foreground">{row.label}</span>
                      {row.badge ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[12px] font-medium">
                          {row.value}
                        </span>
                      ) : (
                        <span className="text-[14px] font-semibold text-foreground">{row.value}</span>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-border pt-5">
                    <button className="w-full h-[44px] inline-flex items-center justify-center text-[14px] font-medium text-white bg-primary hover:opacity-90 rounded-[14px] transition-opacity cursor-pointer">
                      Подать заявку
                    </button>
                  </div>
                  <div className="text-center">
                    <button className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent cursor-pointer">
                      <Bookmark size={16} />
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Card */}
              <div className="p-6 rounded-[24px] bg-card border border-border">
                <h4 className="text-[14px] font-semibold text-foreground mb-4">О компании</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[12px] bg-[#E8F4F4] text-primary flex items-center justify-center text-[18px] font-bold shrink-0">
                      V
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-foreground">Verba Tech</div>
                      <div className="text-[13px] text-muted-foreground">Стартап · Москва</div>
                    </div>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">
                    SaaS-платформа для автоматизации бизнес-процессов. 12 сотрудников, работаем с 2023 года.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["SaaS", "Автоматизация", "B2B"].map((t) => (
                      <span key={t} className="inline-flex items-center px-2.5 py-1 rounded-[8px] bg-muted text-muted-foreground text-[12px] font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {[
                      { value: "3", label: "задачи" },
                      { value: "12", label: "участников" },
                      { value: "4.8", label: "рейтинг" },
                    ].map((s) => (
                      <div key={s.label} className="text-center flex-1">
                        <div className="text-[22px] font-bold font-display text-foreground">{s.value}</div>
                        <div className="text-[12px] text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href="/companies/verba-tech"
                    className="w-full h-[40px] inline-flex items-center justify-center gap-2 text-[13px] font-medium text-foreground bg-transparent border border-border hover:bg-muted rounded-[12px] transition-colors no-underline"
                  >
                    <ExternalLink size={14} />
                    Профиль компании
                  </a>
                </div>
              </div>

              {/* Similar Tasks */}
              <div className="p-6 rounded-[24px] bg-card border border-border">
                <h4 className="text-[14px] font-semibold text-foreground mb-4">Похожие задачи</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { title: "Backend API для мобильного приложения", meta: "DataFlow · 21 день" },
                    { title: "Мини-CRM на React", meta: "PixelForge · 14 дней" },
                    { title: "Интеграция с внешним API", meta: "CloudNine · 10 дней" },
                  ].map((item) => (
                    <a
                      key={item.title}
                      href="/catalog"
                      className="flex items-center justify-between p-3 rounded-[12px] hover:bg-muted transition-colors no-underline group"
                    >
                      <div>
                        <div className="text-[14px] font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                        <div className="text-[12px] text-muted-foreground">{item.meta}</div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
