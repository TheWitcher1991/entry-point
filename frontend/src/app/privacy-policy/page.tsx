import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  Users,
  Bookmark,
  Activity,
  Edit,
  Clock,
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Shield size={28} />
          </div>
          <h1 className="text-[40px] font-bold font-display text-foreground mb-4">
            Политика конфиденциальности
          </h1>
          <p className="text-[18px] text-muted-foreground max-w-[640px] mx-auto">
            Как мы собираем, используем и защищаем ваши персональные данные
          </p>
        </div>
      </section>

      {/* Какие данные собираем */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Eye size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Какие данные мы собираем</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Личные данные">
              <RuleList items={[
                "Имя и фамилия",
                "Адрес электронной почты",
                "Номер телефона (при регистрации компании)",
                "Данные профиля: навыки, образование, опыт работы",
              ]} />
            </RuleSection>

            <RuleSection icon={Activity} title="Автоматически собираемые данные">
              <RuleList items={[
                "IP-адрес и тип браузера",
                "Дата и время посещения",
                "Просмотренные страницы и взаимодействия",
                "Тип устройства и операционная система",
              ]} />
            </RuleSection>
          </div>

          {/* Как используем данные */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Activity size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Как мы используем ваши данные</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={CheckCircle} title="Цели обработки">
              <RuleList items={[
                "Обеспечение работы платформы: регистрация, авторизация, взаимодействие",
                "Подбор задач и рекомендации на основе навыков и предпочтений",
                "Уведомления о статусе заявок, новых задачах и сообщениях",
                "Улучшение качества сервисов и пользовательского опыта",
              ]} />
            </RuleSection>

            <RuleSection icon={FileText} title="Правовые основания">
              <RuleList items={[
                "Исполнение Пользовательского соглашения",
                "Согласие Пользователя на обработку персональных данных",
                "Законные интересы Платформы в развитии сервисов",
                "Исполнение требований законодательства Российской Федерации",
              ]} />
            </RuleSection>
          </div>

          {/* Передача данных третьим лицам */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Передача данных третьим лицам</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={Shield} title="Раскрытие данных">
              <p>
                Платформа не продаёт персональные данные Пользователей третьим лицам. Передача
                данных возможна исключительно в следующих случаях:
              </p>
              <RuleList items={[
                "По запросу уполномоченных государственных органов в порядке, установленном законом",
                "Для обеспечения технической инфраструктуры (хостинг-провайдеры, облачные сервисы), при условии конфиденциальности обработки",
                "В случае реорганизации или продажи бизнеса с уведомлением Пользователей",
              ]} />
            </RuleSection>

            <RuleSection icon={Lock} title="Раскрытие между пользователями">
              <RuleList items={[
                "Данные профиля участника (имя, навыки, портфолио) видны компаниям при подаче заявки",
                "Данные компании (название, описание, контакты) публичны на странице компании",
                "Личные контакты (email, телефон) не раскрываются другим Пользователям без согласия",
              ]} />
            </RuleSection>
          </div>

          {/* Хранение и защита данных */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Хранение и защита данных</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={Shield} title="Меры защиты">
              <RuleList items={[
                "Все данные передаются по защищённому протоколу HTTPS",
                "Персональные данные хранятся на серверах, расположенных на территории РФ",
                "Применяются современные методы шифрования и контроля доступа",
                "Регулярные аудиты безопасности и мониторинг инцидентов",
              ]} />
            </RuleSection>

            <RuleSection icon={Clock} title="Сроки хранения">
              <RuleList items={[
                "Персональные данные хранятся в течение всего срока использования платформы",
                "После удаления учётной записи данные хранятся не более 30 дней для технического восстановления",
                "По истечении 30 дней данные безвозвратно удаляются, за исключением случаев, предусмотренных законом",
                "Обезличенные статистические данные могут храниться бессрочно",
              ]} />
            </RuleSection>
          </div>

          {/* Права пользователей */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Права пользователей</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={FileText} title="Ваши права">
              <RuleList items={[
                "Право на получение информации об обработке персональных данных",
                "Право на исправление неточных или неполных данных",
                "Право на удаление учётной записи и всех связанных данных",
                "Право на отзыв согласия на обработку персональных данных",
              ]} />
            </RuleSection>

            <RuleSection icon={Edit} title="Реализация прав">
              <p>
                Для реализации любого из указанных прав достаточно обратиться в службу поддержки
                через раздел «Контакты» или направить запрос на электронную почту. Запрос
                обрабатывается в течение 30 дней в соответствии с законодательством РФ.
              </p>
            </RuleSection>
          </div>

          {/* Cookies */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bookmark size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Использование Cookies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={Activity} title="Какие cookies мы используем">
              <RuleList items={[
                "Необходимые cookies для авторизации и безопасности сессии",
                "Функциональные cookies для запоминания настроек (тема, язык интерфейса)",
                "Аналитические cookies для сбора статистики использования (Яндекс.Метрика)",
              ]} />
            </RuleSection>

            <RuleSection icon={Shield} title="Управление cookies">
              <p>
                Пользователь может отключить cookies в настройках браузера в любое время. Однако
                отключение необходимых cookies может привести к некорректной работе платформы.
              </p>
            </RuleSection>
          </div>

          {/* Изменения политики */}
          <div className="flex items-center gap-4 mb-10 mt-16">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Edit size={22} />
            </div>
            <h2 className="text-[28px] font-bold font-display text-foreground">Изменения политики конфиденциальности</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <RuleSection icon={AlertTriangle} title="Уведомление об изменениях">
              <p>
                Платформа оставляет за собой право вносить изменения в настоящую Политику
                конфиденциальности. Пользователи уведомляются об изменениях путём публикации новой
                версии на этой странице. Продолжение использования платформы после внесения
                изменений означает согласие с обновлённой Политикой.
              </p>
            </RuleSection>

            <RuleSection icon={FileText} title="Дата последнего обновления">
              <p>
                Текущая версия Политики конфиденциальности вступает в силу с 30 июля 2026 года.
                Рекомендуем периодически проверять эту страницу на предмет изменений.
              </p>
            </RuleSection>
          </div>

          {/* CTA */}
          <div className="p-10 rounded-[24px] bg-muted border border-border text-center mt-16">
            <h3 className="text-[24px] font-bold font-display text-foreground mb-3">
              Остались вопросы?
            </h3>
            <p className="text-[15px] text-muted-foreground mb-6 max-w-[480px] mx-auto">
              Если у вас есть вопросы о том, как мы обрабатываем ваши данные, напишите нам — мы
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
