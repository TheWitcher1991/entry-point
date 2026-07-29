# AGENTS.md — Frontend (Next.js + FSD)

## Стек

- **Next.js 15** — App Router, Server/Client Components
- **React 19** — hooks, concurrent features
- **TypeScript** — strict mode
- **pnpm** — пакетный менеджер
- **shadcn/ui (base-nova)** — 12 компонентов (Button, Card, Badge, Tabs, Avatar, Input, Select, Separator, Dialog, Dropdown-menu, Sheet)
- **@base-ui/react** — бесшовные интерактивные компоненты (Button, useRender, mergeProps)
- **Tailwind CSS v4** — утилитарные классы через `@theme inline` в CSS
- **@tanstack/react-query** — server state (кэш API, синхронизация)
- **effector** — client state (авторизация, формы, UI)
- **react-hook-form + zod** — формы и валидация
- **oxlint** — линтер (замена ESLint)
- **vitest** — тесты

## Команды

```sh
pnpm dev              # dev-сервер (http://localhost:3000)
pnpm build            # production build
pnpm lint             # oxlint --fix
pnpm lint:check       # oxlint (без --fix)
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run
pnpm test:watch       # vitest watch
```

**Перед коммитом:** `pnpm lint:check && pnpm typecheck`

## FSD Architecture

Слои (строго сверху вниз, импорты только из слоёв ниже):

```
app/ (Next.js Router)
  ↓
widgets/ (сложные блоки: header, task-card)
  ↓
features/ (сценарии: auth, create-task, profile-edit)
  ↓
entities/ (бизнес-сущности: user, task, participant, company)
  ↓
shared/ (API, UI-kit, Icons, config, lib)
```

### Правила импортов

- `shared/` **не может** импортировать из `features/`, `entities/`, `widgets/`
- `entities/` **не может** импортировать из `features/`, `widgets/`
- `features/` **не может** импортировать из `widgets/`
- `app/` может импортировать из любого слоя
- `widgets/` может импортировать из `features/`, `entities/`, `shared/`

### Соглашения

- Каждая сущность/фича/виджет — папка с `index.ts` на экспорт
- API-вызовы: отдельный файл `api/index.ts` в каждой сущности/фиче
- Effector stores: `model/stores.ts` + `model/index.ts`
- UI компоненты: `ui/ComponentName.tsx` + `ui/index.ts`
- Типы: `model/types.ts` (если больше 5 строк — выносить из index.ts)

## Effector + React Query

- **React Query** = server state. Все GET-запросы к API. Кэш, ревалидация, refetch.
- **Effector** = client state. Формы, авторизация, UI-состояния, темы.
- Не дублировать состояние: если данные с бэка — React Query, если локальные — effector.
- `$user` store в эффекторе — только текущий пользователь (полученный при логине).

## env

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Дизайн-система

Дизайн-система описана в `DESIGN.md` (корень проекта). Реализована через CSS-переменные в `globals.css`:

### Цвета (shadcn-семантика)

```
:root {
  --background: 0 0% 98%;        /* #fafaf9 */
  --foreground: 0 0% 9%;         /* #171717 */
  --primary: 180 100% 24%;       /* #166666 */
  --secondary: 0 0% 92%;         /* #ebebeb */
  --muted: 0 0% 92%;             /* #ebebeb */
  --accent: 180 100% 24%;        /* #166666 */
  --destructive: 0 84% 60%;      /* #ef4444 */
  --border: 0 0% 85%;            /* #d9d9d9 */
  --input: 0 0% 85%;             /* #d9d9d9 */
  --ring: 180 100% 24%;          /* #166666 */
  --surface: 0 0% 96%;           /* #f5f5f4 */
  --card: 0 0% 100%;             /* #ffffff */
  --text-primary: 0 0% 9%;       /* #171717 */
}

.dark {
  --background: 0 0% 4%;         /* #0a0a0a */
  --foreground: 0 0% 93%;        /* #ededed */
  --primary: 174 61% 47%;        /* #2EC4B6 */
  --secondary: 0 0% 9%;          /* #171717 */
  --muted: 0 0% 14%;             /* #242424 */
  --accent: 174 61% 47%;         /* #2EC4B6 */
  ...
}
```

**Использование в классах:** `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-card`, `border-border`, `bg-muted`, `text-destructive`.

### Tailwind v4 (@theme)

В `globals.css` используется `@theme inline` для регистрации цветов в Tailwind:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-card: var(--card);
  --color-border: var(--border);
  ...
}
```

### Тёмная тема

- Класс `.dark` на `<html>` (не `[data-theme="dark"]`)
- FOUC-prevention: inline `<script>` в `layout.tsx`, который читает `localStorage` и системную тему
- Переключатель: `theme-toggle` в `widgets/`

### Типографика

- **Inter** — основной текст (300, 400, 500, 600, 700)
- **Manrope** — заголовки (500, 600, 700, 800)
- Подключены через `next/font` в `layout.tsx`
- CSS-переменные: `--font-inter`, `--font-manrope`

### Сетка и радиусы

- 8pt базовая сетка (spacing: 4/8/12/16/24/32/48/64)
- Карточки: 24px radius (`rounded-3xl`)
- Кнопки/инпуты: 16px radius (`rounded-2xl`)
- Бейджи: 9999px (`rounded-full`)
- Высота инпутов: 52px (`h-[52px]` или `h-13`)

### Стекло-морфизм

Только для header и popups:
```css
backdrop-filter: blur(12px);
background: hsl(var(--background) / 0.8);
```

## shadcn/ui (base-nova)

12 компонентов в `components/ui/`:
- `Button` — primary/secondary/ghost/outline/destructive, `active:scale-[0.96]`
- `Card` — 24px radius, `bg-card`, `border-border`
- `Badge` — `rounded-full`, варианты default/secondary/outline
- `Tabs` — навигация по вкладкам
- `Avatar` — аватар с fallback
- `Input` — 52px высота, `rounded-2xl`
- `Select` — кастомный селект
- `Separator` — разделитель
- `Dialog` — модальное окно
- `Dropdown-menu` — выпадающее меню
- `Sheet` — боковая панель

**Особенности base-nova:**
- Нет `asChild` — компоненты рендерятся как семантические теги
- `useRender` / `mergeProps` из `@base-ui/react`
- Стили через `cn()` + Tailwind

## make-interfaces-feel-better

Проектный скилл `skills/make-interfaces-feel-better/` — 19 принципов полировки UI.

**Ключевые правила в коде:**
- `active:scale-[0.96]` на всех кнопках и кликабельных элементах
- `transition-[scale,background-color,border-color,opacity] duration-150 ease-out` — без `transition-all`
- `text-wrap: balance` на h1-h4 (глобально в `@layer base`)
- `text-wrap: pretty` на p, li, blockquote (глобально)
- `tabular-nums` для чисел/цен/даты
- Концентрические радиусы: 24px карточка → 16px внутренний элемент
- Тени вместо бордеров для depth
- `antialiased` на body

## Иконки

Кастомные SVG-иконки в `shared/ui/Icons/Icons.tsx`:
- Создаются через `createIcon()` — обёртка над `svg` с `strokeWidth`, `size`
- `strokeWidth={1.5}` для inline, `strokeWidth={2}` для кнопок
- 30+ иконок: Briefcase, TrendingUp, Users, Award, ArrowRight, LogIn, Layers, Clock, Star, UserPlus, Settings, Bell, Menu, X, Moon, Sun, Search, Filter, ChevronDown, Check, Plus, Edit, Trash, Mail, Phone, MapPin, Calendar, Eye, Share, ExternalLink

## Пути (path aliases)

```json
{
  "@/*": ["src/*"],
  "@shared/*": ["src/shared/*"],
  "@entities/*": ["src/entities/*"],
  "@features/*": ["src/features/*"],
  "@widgets/*": ["src/widgets/*"]
}
```

## Структура src/

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout (шрифты, FOUC-script, провайдеры)
│   ├── globals.css   # CSS-переменные + @theme + @layer base
│   ├── page.tsx      # Лендинг
│   ├── catalog/
│   ├── tasks/[id]/
│   ├── how-it-works/
│   ├── company/
│   ├── companies/[id]/
│   ├── register/
│   ├── login/
│   ├── participant/
│   └── providers.tsx # React Query + effector
├── components/ui/    # shadcn/ui
├── shared/           # API, Icons, config, lib
├── entities/         # user, task, participant, company
├── features/         # auth, profile-edit, task-catalog
└── widgets/          # header, footer, task-card, theme-toggle
```

## Ошибки при разработке (история)

1. **Пустой `{}` в PostCSS-опциях ломает Next.js 15.5.22** — баг в `loadPlugin` (plugins.js). Фикс: `{ base: process.cwd() }`
2. **Двойная цветовая система** — старые классы (`text-text-primary`, `bg-surface-secondary`, `bg-accent`) заменены на shadcn во всех 16+ файлах
3. **`transition-all`** — заменён на `transition-[prop,...]` для производительности
