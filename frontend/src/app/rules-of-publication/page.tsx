import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  Eye,
  Lock,
  Ban,
} from "@shared/ui/Icons";
import type { FC } from "react";

interface RuleSectionProps {
  icon: FC<{ size?: number }>;
  title: string;
  children: React.ReactNode;
}

function RuleSection({ icon: Icon, title, children }: RuleSectionProps) {
  return (
    <div className="p-6 rounded-[24px] bg-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <h3 className="text-[20px] font-bold font-display text-foreground">{title}</h3>
      </div>
      <div className="text-[14px] text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-0 list-none">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[14px] text-muted-foreground">
          <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ProhibitedList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-0 list-none">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[14px] text-muted-foreground">
          <Ban size={16} className="text-destructive shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function RulesOfPublicationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <FileText size={28} />
          </div>
          <h1 className="text-[40px] font-bold font-display text-foreground mb-4">
            Правила публикации
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-[640px] mx-auto">
            Требования к задачам, контенту и поведению на платформе «Точка входа»
          </p>
        </div>
      </section>

      {/* Общие требования */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Общие требования</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Что разрешено">
              <RuleList items={[
                "Публикация реальных IT-задач, подходящих для участников любого уровня",
                "Поиск стажёров, джуниоров и практикантов через выполнение тестовых заданий",
                "Формирование кадрового резерва по результатам выполнения задач",
                "Бесплатная публикация неограниченного количества задач",
                "Прямое общение с исполнителями в рамках рабочего пространства",
              ]} />
            </RuleSection>

            <RuleSection icon={Ban} title="Что запрещено">
              <ProhibitedList items={[
                "Задачи, нарушающие законодательство РФ",
                "Коммерческая разработка full-time продуктов без перспективы трудоустройства",
                "Задачи с доступом к критической инфраструктуре или конфиденциальным данным",
                "Требование оплаты от участников за доступ к задаче или платформе",
                "Дискриминация по возрасту, полу, национальности или любым другим признакам",
              ]} />
            </RuleSection>
          </div>

          {/* Требования к задаче */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Briefcase size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Требования к задаче</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <RuleSection icon={FileText} title="Содержание">
              <RuleList items={[
                "Чёткое описание задачи и ожидаемого результата",
                "Критерии приёмки (acceptance criteria)",
                "Технологии и требования к исполнителю",
                "Формат работы (удалённо, смешанно, на месте)",
              ]} />
            </RuleSection>

            <RuleSection icon={Clock} title="Сроки и объём">
              <RuleList items={[
                "Оптимальный срок выполнения: от 3 до 30 дней",
                "Объём задачи: не более 40 часов работы",
                "Для объёмных задач — декомпозиция на подзадачи",
                "Чёткий дедлайн с запасом на проверку",
              ]} />
            </RuleSection>

            <RuleSection icon={Users} title="Взаимодействие">
              <RuleList items={[
                "Обратная связь по заявкам в течение 5 рабочих дней",
                "Проверка результата в течение 7 рабочих дней",
                "Конструктивный отзыв при отказе или возврате на доработку",
                "Подтверждение навыков при успешной сдаче",
              ]} />
            </RuleSection>
          </div>

          {/* Модерация */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Eye size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Модерация задач</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Процесс модерации">
              <p>
                Все задачи перед публикацией проходят обязательную модерацию. Модератор проверяет:
              </p>
              <RuleList items={[
                "Соответствие задачи тематике платформы",
                "Полноту и однозначность описания",
                "Реалистичность требований и сроков",
                "Отсутствие признаков коммерческой разработки",
              ]} />
            </RuleSection>

            <RuleSection icon={AlertTriangle} title="Основания для отклонения">
              <ProhibitedList items={[
                "Неполное или двусмысленное описание задачи",
                "Нереалистичные требования или сроки",
                "Отсутствие критериев приёмки",
                "Признаки полного рабочего проекта без перспективы",
                "Нарушение законодательства или прав третьих лиц",
              ]} />
            </RuleSection>
          </div>

          {/* Права и интеллектуальная собственность */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">
              Интеллектуальная собственность
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Права на результат">
              <RuleList items={[
                "Компания обязана указать политику использования результата при публикации задачи",
                "Варианты: публичный результат, без исходного кода, обезличенно, NDA",
                "По умолчанию участник может указать задачу в портфолио без деталей",
                "Отдельные условия могут быть согласованы в рабочем пространстве",
              ]} />
            </RuleSection>

            <RuleSection icon={Shield} title="Конфиденциальность">
              <RuleList items={[
                "Компания не должна требовать доступ к коммерческой тайне",
                "Участник обязуется не разглашать детали задачи без разрешения",
                "Персональные данные обрабатываются согласно политике конфиденциальности",
                "Платформа не несёт ответственности за соглашения между компанией и участником",
              ]} />
            </RuleSection>
          </div>

          {/* CTA */}
          <div className="p-10 rounded-[24px] bg-muted border border-border text-center mt-16">
            <h3 className="text-[24px] font-bold font-display text-foreground mb-3">
              Остались вопросы?
            </h3>
            <p className="text-[15px] text-muted-foreground mb-6 max-w-[480px] mx-auto">
              Если у вас есть вопросы по правилам публикации или модерации, напишите нам — мы
              ответим в течение одного рабочего дня.
            </p>
            <a
              href="/contacts"
              className="inline-flex items-center px-6 py-3 text-[15px] font-semibold text-white bg-primary hover:opacity-90 rounded-[14px] transition-opacity no-underline"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
