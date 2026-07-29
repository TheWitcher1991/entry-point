# AGENTS.md — Shared (FSD слой)

## Роль

Самый нижний слой FSD. Содержит всё, что не относится к бизнес-логике:
утилиты, UI-кит, иконки, API-клиент, конфиг.

**Никогда не импортирует из:** entities, features, widgets, app.

## Структура

```
shared/
├── api/           # axios-клиент, интерцепторы, базовые типы
│   ├── client.ts  # axios instance + interceptors (JWT)
│   └── index.ts
├── config/        # конфигурация проекта
│   └── index.ts   # API_URL, isDev, и т.д.
├── lib/           # вспомогательные функции
│   └── utils.ts   # cn() для merge классов
└── ui/            # UI-кит
    └── Icons/
        └── Icons.tsx  # 30+ SVG-иконок через createIcon()
```

## api/

`client.ts`:
- Создаёт `axios` instance с `baseURL = config.API_URL`
- Interceptor запроса: добавляет `Authorization: Bearer <token>` из localStorage
- Interceptor ответа: на 401 очищает токен, редиректит на `/login`

## config/

`index.ts`:
- `API_URL` — из `NEXT_PUBLIC_API_URL` или `http://localhost:8000/api/v1`
- `isDev` — `process.env.NODE_ENV === 'development'`

## lib/

`utils.ts`:
- `cn()` — `clsx` + `tailwind-merge` для merge Tailwind-классов
- Используется во всех shadcn/ui компонентах

## ui/

### Иконки

`Icons/Icons.tsx`:
- Все иконки создаются через `createIcon()` — фабрику с `strokeWidth`, `size`, `viewBox`
- `size` по умолчанию: `"current"` (наследуется от родителя)
- `strokeWidth`: `1.5` для inline, `2` для кнопок
- 30+ иконок: Briefcase, TrendingUp, Users, Award, ArrowRight, LogIn, Layers, Clock, Star, UserPlus, Settings, Bell, Menu, X, Moon, Sun, Search, Filter, ChevronDown, Check, Plus, Edit, Trash, Mail, Phone, MapPin, Calendar, Eye, Share, ExternalLink

## Важно

- **Никакой бизнес-логики** — только инфраструктура и утилиты
- **Никаких импортов** из entities/features/widgets/app
- API-клиент использует только стандартные HTTP-методы, без доменной логики
- Иконки — чистый SVG, никаких внешних зависимостей
