import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 no-underline mb-4">
              <Image
                src="/logo.png"
                alt="Точка входа"
                width={32}
                height={32}
                className="shrink-0"
              />
              <span className="text-[20px] font-bold text-primary font-display">Точка входа</span>
            </Link>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[240px]">
              Платформа проектного старта карьеры. Реальные задачи IT-компаний для начинающих специалистов.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider mb-4">
              Платформа
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/catalog" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Каталог задач
              </Link>
              <Link href="/companies" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Компании
              </Link>
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Как это работает
              </Link>
              <Link href="/register" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Для компаний
              </Link>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider mb-4">
              Участникам
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/register" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Создать профиль
              </Link>
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Как это работает
              </Link>
              <Link href="/how-it-works#faq" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[13px] font-semibold text-foreground uppercase tracking-wider mb-4">
              Правовая информация
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Пользовательское соглашение
              </Link>
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Правила публикации
              </Link>
              <Link href="/how-it-works" className="text-[14px] text-muted-foreground hover:text-primary no-underline transition-colors">
                Контакты
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Точка входа. Все права защищены.</span>
          <span>Сделано с заботой о начинающих специалистах</span>
        </div>
      </div>
    </footer>
  );
}
