# Frontend

> **Stack:** Next.js 15, React 19, TypeScript, pnpm, Tailwind CSS v4, shadcn/ui (base-nova)

---

## Commands

```sh
pnpm dev              # Dev server → http://localhost:3000
pnpm build            # Production build
pnpm lint             # oxlint --fix
pnpm lint:check       # oxlint (no --fix)
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run
```

**Before commit:** `pnpm lint:check && pnpm typecheck`

---

## FSD structure

```
src/
├── app/               # Pages (Next.js App Router)
│   ├── page.tsx       # Landing
│   ├── catalog/       # Task catalog
│   ├── tasks/[id]/    # Task detail
│   ├── companies/     # Company list
│   ├── participant/   # Participant dashboard
│   ├── company/       # Company dashboard
│   ├── admin/         # Admin panel
│   ├── layout.tsx     # Root layout + providers
│   ├── providers.tsx  # React Query + effector
│   └── globals.css    # Design tokens
├── components/ui/     # shadcn/ui components
├── shared/            # API client, icons, lib, config
├── entities/          # User, task, participant, company...
├── features/          # Auth, task-submit, profile-edit...
└── widgets/           # Header, footer, task-card...
```

### Import rules

`shared ← entities ← features ← widgets ← app` (top-to-bottom only)

---

## shadcn/ui (base-nova)

- No `asChild` — uses `@base-ui/react` (Button, useRender, mergeProps)
- Components in `src/components/ui/`
- Customised via `tailwind.config.ts` and `globals.css`

---

## Tailwind CSS v4

- CSS variables in `globals.css` via `@theme inline { --color-*: var(--*) }`
- Light/dark theme: `:root` / `.dark`
- **Bug next@15.5.22:** empty PostCSS options `{}` break `@tailwindcss/postcss` — always pass `{ base: process.cwd() }`

---

## State management

| Type | Tool |
|------|------|
| Server state | `@tanstack/react-query` |
| Client state | `effector` |

No duplication — each domain uses the appropriate tool.

---

## Middleware

`middleware.ts` handles role-based route protection:

- `/participant/*` → requires `participant` role
- `/company/*` → requires `company` role
- `/admin/*` → requires `admin` role
- Unauthenticated users redirected to `/login`

---

## Forms

- `react-hook-form` for complex multi-field forms
- `zod` for validation schemas (shared types with backend)

---

## Design tokens

Use shadcn semantic classes:

```tsx
// ✅ Correct
<div className="bg-card text-foreground">
  <h2 className="text-lg font-semibold">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ Wrong
<div style={{ background: 'var(--color-surface)' }}>
```

All statuses are plain strings in the API — use lookup objects/maps on the frontend for display labels and colours.
