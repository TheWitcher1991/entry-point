import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  UserPlus,
  Lock,
  Bookmark,
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

export default function TermsPage() {
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
            Пользовательское соглашение
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-[640px] mx-auto">
            Условия использования платформы «Точка входа» для участников и компаний
          </p>
        </div>
      </section>

      {/* Общие положения */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Shield size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Общие положения</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Предмет соглашения">
              <p>
                Настоящее Пользовательское соглашение регулирует отношения между ООО ТалентСпот
                (далее — «Платформа») и физическими или юридическими лицами (далее — «Пользователи»),
                возникающие при использовании сервисов платформы «Точка входа».
              </p>
            </RuleSection>

            <RuleSection icon={Bookmark} title="Акцепт условий">
              <p>
                Использование платформы означает безоговорочное согласие Пользователя с настоящим
                Соглашением. Если Пользователь не согласен с условиями, он обязан немедленно
                прекратить использование сервисов платформы.
              </p>
              <p>
                Платформа оставляет за собой право вносить изменения в Соглашение в одностороннем
                порядке. Изменения вступают в силу с момента их публикации.
              </p>
            </RuleSection>
          </div>

          {/* Статус сторон */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Статус сторон</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={Shield} title="Платформа">
              <p>
                ООО ТалентСпот предоставляет информационные и коммуникационные услуги по размещению
                задач и взаимодействию между участниками и компаниями. Платформа не является
                стороной трудовых или гражданско-правовых отношений между Пользователями.
              </p>
            </RuleSection>

            <RuleSection icon={Users} title="Участники и компании">
              <RuleList items={[
                "Участник — физическое лицо, зарегистрированное на платформе для выполнения задач и получения опыта",
                "Компания — юридическое лицо или ИП, публикующее задачи с целью поиска исполнителей и формирования кадрового резерва",
                "Ни участник, ни компания не вправе требовать признания отношений трудовыми на основании использования платформы",
              ]} />
            </RuleSection>
          </div>

          {/* Порядок регистрации */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Порядок регистрации и учётные записи</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Регистрация">
              <RuleList items={[
                "Регистрация на платформе бесплатна и добровольна",
                "При регистрации Пользователь обязан указать достоверные и актуальные данные",
                "После регистрации создаётся учётная запись, доступ к которой осуществляется с помощью логина и пароля",
                "Один Пользователь может иметь только одну учётную запись",
              ]} />
            </RuleSection>

            <RuleSection icon={Lock} title="Безопасность учётной записи">
              <RuleList items={[
                "Пользователь несёт ответственность за сохранность своих учётных данных",
                "Запрещена передача учётных данных третьим лицам",
                "Платформа вправе заблокировать учётную запись при подозрении на несанкционированный доступ",
                "Обо всех случаях компрометации учётных данных необходимо немедленно сообщать в службу поддержки",
              ]} />
            </RuleSection>
          </div>

          {/* Правила публикации задач */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Правила публикации задач</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Требования к публикации">
              <RuleList items={[
                "Компания обязуется публиковать только реальные задачи, соответствующие тематике платформы",
                "Описание задачи должно быть полным, однозначным и содержать критерии приёмки",
                "Задача не должна требовать доступа к коммерческой тайне или критической инфраструктуре",
                "Платформа проводит обязательную модерацию всех задач перед публикацией",
              ]} />
            </RuleSection>

            <RuleSection icon={AlertTriangle} title="Ограничения">
              <RuleList items={[
                "Запрещена публикация задач, нарушающих законодательство Российской Федерации",
                "Запрещено требование оплаты от участников за доступ к задаче или платформе",
                "Запрещена дискриминация по любым признакам",
                "Платформа вправе отклонить или удалить задачу, нарушающую правила",
              ]} />
            </RuleSection>
          </div>

          {/* Порядок выполнения задач */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Порядок выполнения задач</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Подача заявки и выполнение">
              <RuleList items={[
                "Участник подаёт заявку на задачу через интерфейс платформы",
                "Компания рассматривает заявки и выбирает исполнителя в течение 5 рабочих дней",
                "После принятия заявки участник обязуется выполнить задачу в установленный срок",
                "Результат выполнения направляется через платформу для проверки компанией",
              ]} />
            </RuleSection>

            <RuleSection icon={Clock} title="Приёмка и обратная связь">
              <RuleList items={[
                "Компания проверяет результат в течение 7 рабочих дней с момента получения",
                "По итогам проверки компания принимает работу или возвращает на доработку с обоснованием",
                "При успешной приёмке навыки участника подтверждаются в профиле",
                "Споры по результатам выполнения решаются сторонами самостоятельно с привлечением платформы как медиатора",
              ]} />
            </RuleSection>
          </div>

          {/* Интеллектуальная собственность */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Интеллектуальная собственность</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Права на результаты">
              <RuleList items={[
                "Условия использования результата задачи определяются компанией при публикации",
                "По умолчанию участник вправе указать выполненную задачу в портфолио без раскрытия конфиденциальных деталей",
                "Компания вправе установить NDA или иные ограничения до начала выполнения задачи",
                "Платформа не претендует на права на результаты интеллектуальной деятельности Пользователей",
              ]} />
            </RuleSection>

            <RuleSection icon={Shield} title="Конфиденциальность">
              <RuleList items={[
                "Компания не вправе требовать от участника разглашения коммерческой тайны",
                "Участник обязуется не разглашать условия задачи и материалы без письменного разрешения компании",
                "Платформа принимает меры для защиты конфиденциальной информации в соответствии с политикой конфиденциальности",
                "Платформа не несёт ответственности за нарушения конфиденциальности со стороны Пользователей",
              ]} />
            </RuleSection>
          </div>

          {/* Ответственность сторон */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Ответственность сторон</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={Shield} title="Ответственность платформы">
              <RuleList items={[
                "Платформа обеспечивает техническую доступность сервисов, за исключением случаев форс-мажора",
                "Платформа не гарантирует, что задачи приведут к трудоустройству или иному коммерческому результату",
                "Платформа не несёт ответственности за содержание задач и результатов их выполнения",
                "Платформа не является стороной соглашений между участниками и компаниями",
              ]} />
            </RuleSection>

            <RuleSection icon={AlertTriangle} title="Ответственность пользователей">
              <RuleList items={[
                "Пользователи несут полную ответственность за достоверность предоставленной информации",
                "Нарушение условий Соглашения может повлечь блокировку учётной записи без предупреждения",
                "Пользователь обязуется возместить убытки, причинённые платформе или третьим лицам в результате нарушения Соглашения",
                "Споры между участником и компанией разрешаются в порядке, установленном законодательством РФ",
              ]} />
            </RuleSection>
          </div>

          {/* Заключительные положения */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bookmark size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Заключительные положения</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Применимое право и споры">
              <RuleList items={[
                "Настоящее Соглашение регулируется законодательством Российской Федерации",
                "Все споры и разногласия решаются путём переговоров. При недостижении согласия — в судебном порядке по месту нахождения Платформы",
                "Признание недействительным какого-либо положения Соглашения не влечёт недействительность остальных положений",
              ]} />
            </RuleSection>

            <RuleSection icon={Clock} title="Срок действия и изменение">
              <RuleList items={[
                "Соглашение вступает в силу с момента акцепта Пользователем и действует бессрочно",
                "Платформа вправе изменить Соглашение с уведомлением Пользователей путём публикации новой версии",
                "Продолжение использования платформы после внесения изменений означает согласие с новой версией Соглашения",
              ]} />
            </RuleSection>
          </div>

          {/* CTA */}
          <div className="p-10 rounded-[24px] bg-muted border border-border text-center mt-16">
            <h3 className="text-[24px] font-bold font-display text-foreground mb-3">
              Вопросы по соглашению?
            </h3>
            <p className="text-[15px] text-muted-foreground mb-6 max-w-[480px] mx-auto">
              Если у вас есть вопросы по условиям использования платформы, напишите нам — мы
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
