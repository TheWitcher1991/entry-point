# AGENTS.md — Features (FSD слой)

## Роль

Пользовательские сценарии и бизнес-фичи. Каждая фича — законченный функциональный блок.

**Может импортировать из:** entities, shared
**Не может импортировать из:** widgets, app

## Структура

```
features/
├── auth/               # Авторизация (логин, регистрация, логаут)
├── company-profile/    # Редактирование профиля компании
├── participant-profile/ # Редактирование профиля участника
└── task-catalog/       # Каталог задач (фильтры, поиск)
```

### Шаблон фичи

```
feature-name/
├── index.ts              # публичный экспорт
├── model/
│   ├── stores.ts         # Effector stores (client state)
│   ├── types.ts          # типы, специфичные для фичи
│   └── index.ts
├── ui/
│   ├── ComponentName.tsx # React-компоненты
│   └── index.ts
└── api/
    └── index.ts          # API-вызовы (если не через entities)
```

## Правила

1. **UI-компоненты** — в `ui/`, каждый компонент в отдельном файле
2. **Client state** — в `model/stores.ts` (effector), не React Query
3. **Server state** — через React Query в компонентах или через entities/api
4. **Форма** — react-hook-form + zod схема в `ui/`
5. **Минимум дублирования** — переиспользуй entities и shared

## Текущие фичи

### auth
- Логин (`LoginForm`), регистрация (`RegisterForm`), логаут
- Effector stores: `$user`, `$isAuthenticated`, `$authError`
- Сохранение токена в localStorage
- Редирект после логина на соответствующий дашборд

### company-profile
- Форма редактирования профиля компании
- Поля: название, описание, лого, контакты

### participant-profile
- Форма редактирования профиля участника
- Поля: имя, специализация, портфолио

### task-catalog
- Фильтры (статус, категория, дата)
- Поиск по названию
- Сортировка (по дате, по популярности)

## Важно

- **Не дублировать entities** — если API-вызов относится к сущности, он в entities, не в features
- **Effector vs React Query** — формы и UI-состояния через effector, данные с бэка через React Query
- **Фичи не импортируют виджеты** — только shared и entities
