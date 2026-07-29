# AGENTS.md — opencode конфигурация

## Что это

Папка `.opencode/` содержит конфигурацию opencode-окружения: агентные прокси, команды, скрипты, настройки.

## Структура

```
.opencode/
├── AGENTS.md           # этот файл
├── .gitignore
├── package.json        # npm-зависимости для скриптов opencode
├── package-lock.json
├── node_modules/       # установленные пакеты
├── agent/              # прокси-файлы агентов BMAD (20 шт.)
│   ├── bmad-agent-bmad-master.md
│   ├── bmad-agent-bmb-agent-builder.md
│   ├── bmad-agent-bmb-module-builder.md
│   ├── bmad-agent-bmb-workflow-builder.md
│   ├── bmad-agent-bmm-analyst.md
│   ├── bmad-agent-bmm-architect.md
│   ├── bmad-agent-bmm-dev.md
│   ├── bmad-agent-bmm-pm.md
│   ├── bmad-agent-bmm-qa.md
│   ├── bmad-agent-bmm-quick-flow-solo-dev.md
│   ├── bmad-agent-bmm-sm.md
│   ├── bmad-agent-bmm-tech-writer.md
│   ├── bmad-agent-bmm-ux-designer.md
│   ├── bmad-agent-cis-brainstorming-coach.md
│   ├── bmad-agent-cis-creative-problem-solver.md
│   ├── bmad-agent-cis-design-thinking-coach.md
│   ├── bmad-agent-cis-innovation-strategist.md
│   ├── bmad-agent-cis-presentation-master.md
│   ├── bmad-agent-cis-storyteller.md
│   └── bmad-agent-tea-tea.md
└── command/            # команды BMAD (56 шт.)
    ├── bmad-bmb-create-agent.md
    ├── bmad-bmb-create-module-brief.md
    ├── bmad-bmb-create-module.md
    ├── bmad-bmb-create-workflow.md
    ├── bmad-bmb-edit-agent.md
    ├── bmad-bmb-edit-module.md
    ├── bmad-bmb-edit-workflow.md
    ├── bmad-bmb-rework-workflow.md
    ├── bmad-bmb-validate-agent.md
    ├── bmad-bmb-validate-max-parallel-workflow.md
    ├── bmad-bmb-validate-module.md
    ├── bmad-bmb-validate-workflow.md
    ├── bmad-bmm-check-implementation-readiness.md
    ├── bmad-bmm-code-review.md
    ├── bmad-bmm-correct-course.md
    ├── bmad-bmm-create-architecture.md
    ├── bmad-bmm-create-epics-and-stories.md
    ├── bmad-bmm-create-prd.md
    ├── bmad-bmm-create-product-brief.md
    ├── bmad-bmm-create-story.md
    ├── bmad-bmm-create-ux-design.md
    ├── bmad-bmm-dev-story.md
    ├── bmad-bmm-document-project.md
    ├── bmad-bmm-domain-research.md
    ├── bmad-bmm-edit-prd.md
    ├── bmad-bmm-generate-project-context.md
    ├── bmad-bmm-market-research.md
    ├── bmad-bmm-qa-generate-e2e-tests.md
    ├── bmad-bmm-quick-dev.md
    ├── bmad-bmm-quick-spec.md
    ├── bmad-bmm-retrospective.md
    ├── bmad-bmm-sprint-planning.md
    ├── bmad-bmm-sprint-status.md
    ├── bmad-bmm-technical-research.md
    ├── bmad-bmm-validate-prd.md
    ├── bmad-brainstorming.md
    ├── bmad-cis-design-thinking.md
    ├── bmad-cis-innovation-strategy.md
    ├── bmad-cis-problem-solving.md
    ├── bmad-cis-storytelling.md
    ├── bmad-editorial-review-prose.md
    ├── bmad-editorial-review-structure.md
    ├── bmad-help.md
    ├── bmad-index-docs.md
    ├── bmad-party-mode.md
    ├── bmad-review-adversarial-general.md
    ├── bmad-shard-doc.md
    ├── bmad-tea-teach-me-testing.md
    ├── bmad-tea-testarch-atdd.md
    ├── bmad-tea-testarch-automate.md
    ├── bmad-tea-testarch-ci.md
    ├── bmad-tea-testarch-framework.md
    ├── bmad-tea-testarch-nfr.md
    ├── bmad-tea-testarch-test-design.md
    ├── bmad-tea-testarch-test-review.md
    └── bmad-tea-testarch-trace.md
```

## Прокси-файлы агентов (.opencode/agent/*.md)

Каждый proxy-файл — это точка входа для загрузки агента BMAD.
Содержит `<agent-activation>` блок с инструкциями и путём к полному агенту в `_bmad/`.

**Формат названия:** `bmad-agent-{module}-{agent-name}.md`

Пример (`bmad-agent-bmm-dev.md`):
```markdown
<agent-activation CRITICAL="TRUE">
1. LOAD the FULL agent file from {project-root}/_bmad/bmm/agents/dev.md
2. READ its entire contents
3. FOLLOW every step in the <activation> section precisely
4. DISPLAY the welcome/greeting
5. PRESENT the numbered menu
6. WAIT for user input
</agent-activation>
```

## Команды (.opencode/command/*.md)

Каждый command-файл определяет команду, доступную через opencode.
Может содержать инструкции для агентов, шаблоны запросов, скрипты.

## Редактирование opencode-конфигурации

Для редактирования `.opencode/` используй скилл `customize-opencode`.
Он активируется, когда задача касается:
- opencode.json / opencode.jsonc
- .opencode/agent/*.md
- .opencode/command/*.md
- ~/.config/opencode/
