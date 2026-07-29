# AGENTS.md — Entities (FSD слой)

## Роль

Бизнес-сущности проекта. Каждая сущность — папка с моделью, API-вызовами, типами.

**Может импортировать из:** shared
**Не может импортировать из:** features, widgets, app

## Структура

```
entities/
├── user/           # Пользователь (общая модель)
├── task/           # Задача (объявление)
├── participant/    # Участник (роль и профиль)
└── company/        # Компания (роль и профиль)
```

### Шаблон сущности

Каждая сущность следует единой структуре:

```
entity-name/
├── index.ts              # публичный экспорт
├── model/
│   ├── types.ts          # TypeScript типы и интерфейсы
│   └── stores.ts         # Effector stores (если не server-only)
└── api/
    └── index.ts          # API-вызовы (через shared/api/client.ts)
```

### Пример: user/

```
user/
├── index.ts              # export { type User, ... }
├── model/
│   └── types.ts          # User, UserRole, UserStatus
└── api/
    └── index.ts          # getUser, updateUser, getUsers
```

## Правила

1. **API в каждой сущности** — вызовы к бэкенду для этой сущности
2. **Effector stores** — только если данные нужны на клиенте без бэка (например, временные фильтры)
3. **Типы** — в `model/types.ts`, публичные типы реэкспортируются через `index.ts`
4. **Модели чисты** — без UI-логики, форматирования, трансформаций под отображение

## Текущие сущности

### user
- `User` — базовая модель пользователя (id, email, имя, роль)
- `UserRole` — `participant | company | admin`
- API: `getUser`, `updateUser`

### task
- `Task` — модель задачи/объявления
- `TaskStatus` — статусы задачи (по справочнику MVP)
- API: `getTasks`, `getTask`, `createTask`, `updateTask`

### participant
- `Participant` — профиль участника (расширяет User)
- API: `getParticipantProfile`, `updateParticipantProfile`

### company
- `Company` — профиль компании (расширяет User)
- API: `getCompanyProfile`, `updateCompanyProfile`

## Важно

- **Серверные данные** — через React Query (tanstack), не через effector
- **Типы синхронизированы** с бэкенд-схемами (pydantic → TypeScript)
- **Не использовать any** — все API-ответы типизированы
