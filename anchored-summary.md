# Anchored Summary

## Goal
Завершить MVP-цикл: добавить избранное (bookmarks) для задач, страницу профиля с достижениями, починить пагинацию и отображение статуса заявок, починить результаты участников, добавить модерацию результатов в дашборд компании.

## Constraints & Preferences
- Skeleton из `@/components/ui/skeleton` (`rounded-2xl`, `animate-pulse`)
- `active:scale-[0.96]` на всех кнопках
- Никаких `any`, `@ts-ignore`, хардкода
- Модалка диалоговая (через `@/components/ui/dialog`), а не статический блок
- `pnpm build` не запускать

## Progress
### Done
- **Bookmarks detail endpoint** — `GET /tasks/bookmarks/detail` с eager loading (joinedload company + selectinload skills.skill)
- **Страница /saved** — standalone (вне dashboard layout), с загрузкой, пустым состоянием, списком сохранённых задач
- **Иконка закладки в хедере** — рядом с колокольчиком уведомлений (только для авторизованных)
- **Аватар кликабельный** — ссылается на `/participant/profile` или `/company/profile`
- **Футер в dashboard layout** — `<Footer />` добавлен в `(dashboard)/layout.tsx`
- **Дизайн профилей** — обе страницы (`/participant/profile`, `/company/profile`) получили Header, `min-h-screen flex flex-col`, правильную структуру
- **Редизайн профиля участника** — hero (аватар, имя, роль, город, статус), статистика (завершено, отзывы, рейтинг, навыки), достижения (карточки с отзывами и звёздами), коллапсируемая форма редактирования
- **Отступы увеличены** — во всех dashboard-страницах `py-8` → `pt-10 pb-8` (контент не лезет в меню)
- **Пагинация каталога** — динамические кнопки вокруг текущей страницы (±2), эллипсис, авто-сброс на пустой странице, пагинация видна даже на пустой странице
- **ApplyButton проверяет существующие заявки** — запрашивает `getMyApplications`, ищет `task_id`, показывает «Заявка отправлена» / статус заявки вместо кнопки
- **Статус заявки в task detail** — `ApplyButton` показывает конкретный статус («На рассмотрении», «Одобрена» и т.д.) с цветовой индикацией (янтарный/зелёный/серый)
- **Фикс `/participants/me/reviews`** — добавлен отдельный эндпоинт до параметризованного `/{participant_id}/reviews`
- **Бэкенд эндпоинт `GET /tasks/{task_id}/my-submission`** — для получения участником своего собственного сабмита (не требует проверки прав компании)
- **Фикс participant task workspace** — переведён с `getTaskSubmissions` (только для компании) на `getMySubmission` (работает для участников)
- **Страница `/company/submissions`** — модерация результатов из дашборда компании: все pending submissions в одном месте, approve/reject с комментарием, разделение на ожидающие и проверенные
- **Навигация в дашборде компании** — добавлены табы «Заявки», «Результаты», «Сохранённые» на главной странице дашборда
- Seed фикс: статусы `"active"` → `"open"`, авто-миграция старых данных, email `@test.local` → `@example.com`
- Global error boundary, Custom 404, RUNBOOK.md, CI/CD, CORS конфиг
- Все изменения закоммичены (pycache удалён из репозитория)

### In Progress
- (none)

### Blocked
- (none)

## Key Decisions
- **Bookmark toggle** — один POST-эндпоинт добавляет/удаляет, а не два отдельных
- **Сохранённые — standalone страница** — вынесена из dashboard layout (`/saved`), чтобы была доступна без авторизации (редирект на логин внутри)
- **Аватар → профиль** — вместо отдельной ссылки «Профиль» в хедере сделали кликабельную аватарку (меньше визуального шума)
- **ApplyButton сам проверяет заявки** — через `getMyApplications` с фильтром по `taskId`, а не через пропс от родителя (меньше связанности)
- **Статус заявки — в task detail, не в каталоге** — пользователю удобнее видеть статус на странице задачи, а не на карточке в списке
- **My-submission вместо getTaskSubmissions для участников** — отдельный эндпоинт, который не проверяет права компании и возвращает только сабмит текущего пользователя
- **Модерация результатов в дашборде** — отдельная страница `/company/submissions` с агрегацией всех pending сабмитов по всем задачам компании, каждый сабмит имеет свой комментарий

## Next Steps
- Запушить коммит на GitHub
- Проверить работу флоу: регистрация → заявка → отправка результата → модерация из дашборда

## Critical Context
- **Seed статусы задач**: фронтенд ищет `status: "open"`, seed раньше создавал `"active"` — исправлено
- **Seed email домен**: `email-validator` 2.x блокирует `.local` — все тестовые email изменены на `@example.com`
- **Bookmark API**: `GET /tasks/bookmarks` (IDs), `GET /tasks/bookmarks/detail` (полные данные), `POST /tasks/{id}/bookmark` (toggle)
- **Submission API**: `GET /tasks/{id}/submissions` (для компании), `GET /tasks/{id}/my-submission` (для участника), `POST /tasks/{id}/submit` (создать), `PATCH /tasks/{id}/submissions/{sub_id}/review` (проверить)
- **Команды**: `pnpm typecheck` и `pnpm lint:check` — основные для проверки; `pnpm build` не запускать
- **Backend**: `uvicorn :8000` (reload), **Frontend**: `next dev -p 3001`
- **Проблема с pycache**: `__pycache__/` были закоммичены — удалены из Git через `git rm --cached`, .gitignore работает корректно

## Relevant Files
- `backend/app/services/tasks/router.py` — bookmark endpoints + my-submission endpoint + submissions endpoints
- `frontend/src/app/saved/page.tsx` — standalone страница сохранённых задач
- `frontend/src/widgets/header/ui/Header.tsx` — иконка закладки, кликабельный аватар
- `frontend/src/app/(dashboard)/layout.tsx` — Footer добавлен
- `frontend/src/app/(dashboard)/participant/profile/page.tsx` — редизайн: hero, stats, achievements, edit form
- `frontend/src/app/(dashboard)/company/profile/page.tsx` — пофиксен дизайн (Header + структура)
- `frontend/src/app/catalog/page.tsx` — починенная пагинация (динамические кнопки, эллипсис, авто-сброс)
- `frontend/src/features/application-apply/ui/ApplyButton.tsx` — проверка существующих заявок, показ статуса
- `frontend/src/entities/task/api/index.ts` — `getSavedTasks()`, `getSavedTaskIds()`, `toggleBookmark()`
- `backend/app/services/participants/router.ts` — добавлен `GET /me/reviews`
- `frontend/src/app/(dashboard)/participant/tasks/[id]/page.tsx` — исправлен запрос сабмита (использует getMySubmission)
- `frontend/src/app/(dashboard)/company/submissions/page.tsx` — новая страница модерации результатов из дашборда
- `frontend/src/app/(dashboard)/company/page.tsx` — навигация с табами Заявки/Результаты/Сохранённые
- `frontend/src/entities/submission/api/index.ts` — добавлен `getMySubmission()`
