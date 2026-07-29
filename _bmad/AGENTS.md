# AGENTS.md — BMAD-фреймворк

## Что такое BMAD

BMAD (Business → Model → Architecture → Development) — фреймворк управления разработкой. Весь проект проходит через фазы:

```
Discovery → Product → Architecture → Story Prep → Implementation → QA → Handoff
```

## Структура _bmad/

```
_bmad/
├── AGENTS.md               # этот файл
├── _config/                # конфигурация BMAD
│   └── agent-manifest.csv  # манифест всех агентов
├── discovery/              # артефакты Discovery-фазы
├── product/                # артефакты Product-фазы
├── architecture/           # артефакты Architecture-фазы
├── story-prep/             # артефакты Story Prep-фазы
├── implementation/         # артефакты Implementation-фазы
│   └── SPRINT-001.md       # текущий спринт
├── qa/                     # артефакты QA-фазы
└── handoff/                # артефакты Handoff-фазы
```

## Текущая фаза

**Implementation** — Sprint 001 (auth, роли, профили, справочники).

Спринт-документ: `_bmad/implementation/SPRINT-001.md`

Перед началом работы сверяйся со спринтом: какие задачи, критерии приёмки, что должно быть готово.

## Агенты

Полный список агентов: `_bmad/_config/agent-manifest.csv`

### Типы агентов

| Тип | Описание |
|-----|----------|
| **BMM** | Business & Management (analyst, architect, pm, sm, dev, qa, tech-writer, ux-designer) |
| **BMB** | BMAD Builders (agent-builder, module-builder, workflow-builder) |
| **CIS** | Creative & Innovation (brainstorming-coach, creative-problem-solver, design-thinking-coach, innovation-strategist, presentation-master, storyteller) |
| **TEA** | Testing & Education (tea) |

### Прокси-файлы агентов

Агенты загружаются через proxy-файлы в `.opencode/agent/bmad-agent-*.md`.
Каждый proxy указывает путь к полному определению агента в `_bmad/`.

**Загрузка агента:** следуй инструкции `<agent-activation>` в proxy-файле.

### Команды

Команды BMAD находятся в `.opencode/command/bmad-*.md`.
Доступные команды (56 шт.):
- `bmad-bmb-create-agent`, `bmad-bmb-edit-agent`, `bmad-bmb-validate-agent` — управление агентами
- `bmad-bmb-create-module`, `bmad-bmb-edit-module` — управление модулями
- `bmad-bmb-create-workflow`, `bmad-bmb-edit-workflow` — управление воркфлоу
- `bmad-bmm-create-prd`, `bmad-bmm-validate-prd`, `bmad-bmm-edit-prd` — PRD
- `bmad-bmm-create-architecture` — архитектура
- `bmad-bmm-create-story`, `bmad-bmm-dev-story` — stories
- `bmad-bmm-sprint-planning`, `bmad-bmm-sprint-status` — спринты
- `bmad-bmm-qa-generate-e2e-tests` — тесты
- `bmad-bmm-quick-dev`, `bmad-bmm-quick-spec` — быстрый режим
- `bmad-help`, `bmad-party-mode` — вспомогательные

## Артефакты фаз

Каждая фаза пишет артефакт в свою папку. Артефакты — это документы с решениями, схемами, планами.

**Discovery:** user research, market analysis, problem statement
**Product:** PRD, product brief, UX design, personas
**Architecture:** ADR, architecture doc, API contracts, NFRs
**Story Prep:** epics, stories, acceptance criteria
**Implementation:** спринты, технические заметки
**QA:** test plans, bug reports, regression results
**Handoff:** deployment docs, runbooks, release notes
