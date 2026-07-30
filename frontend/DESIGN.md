# Design System

> Современная дизайн-система для цифровых продуктов, ориентированных на студентов, молодых специалистов и IT-команды.

**Основная идея:** *меньше элементов — больше смысла.*

---

## Principles

| Principle | Description |
|-----------|-------------|
| **Large surfaces** | One big card > four small ones. Card = large header + 1–2 secondary texts + primary action. |
| **Minimum text** | Each screen reads in seconds. Short headers, visual indicators over words. |
| **Low density** | Intentional whitespace is a compositional element. |
| **Big cards** | Large padding, large radius, minimal borders, light background. |
| **Few lines** | Dividers are rare — use space, surface levels, composition instead. |
| **Large radius** | Input 16px, Card 24px, Modal 28px, Button 16–20px, Widget 24px. |

---

## Typography

### Fonts

- **Body:** Inter (300–700)
- **Headings:** Manrope (500–800)

### Sizes

| Element | Size | Weight |
|---------|------|--------|
| H1–H4 | 36–48px | 600–700 |
| Subtitle | 20–24px | 600 |
| Body | 16px | 400–500 |
| Secondary | 14px | 400 |
| Caption | 12–13px | 400 (rare) |

---

## Color system

### Light theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent` | `#166666` | Buttons, active states, graphs |
| `--color-background` | `#F7F8F7` | Page background |
| `--color-surface` | `#FFFFFF` | Card backgrounds |
| `--color-primary-text` | `#1E1E1E` | Main text |
| `--color-secondary-text` | `#6E7478` | Secondary text |
| `--color-border` | `#ECECEC` | Borders |
| `--color-hover` | `#EEF8F7` | Hover state |
| `--color-light-accent` | `#E4F3F2` | Light accent |

### Dark theme

| Token | Hex |
|-------|-----|
| `--color-accent` | `#2EC4B6` |
| Various | Balanced with dark bg |

### shadcn semantic tokens

Use CSS variables, not raw hex, in templates:

```
bg-background    text-foreground    text-muted-foreground
bg-primary       bg-card            bg-muted
border-border    text-destructive
```

---

## Components

### Buttons

| Type | Style |
|------|-------|
| Primary | `bg-accent` + white text, radius 16–18px |
| Secondary | White + thin border + dark text |
| Ghost | No background |

All clickables: `active:scale-[0.96]`

### Inputs

- Height: 48–52px
- Minimal borders, accent on focus
- Radius: 16px rounded-2xl

### Cards

- Padding: 24px+
- Radius: 24px rounded-3xl
- No border — use shadows

### Navigation

- Top bar, compact
- Large items, minimum text
- Icons + active highlight

---

## Dark theme

- Class `.dark` on `<html>`
- Stored in `localStorage`, read by inline script (FOUC-free)
- Toggle via `ThemeToggle` in header

---

## Glassmorphism

Only for: header, popups, modals, notifications, dropdowns.

| Param | Value |
|-------|-------|
| Opacity | 65–80% |
| Background | `rgba(255,255,255,0.6–0.8)` |
| Backdrop blur | 16–24px |
| Border | Thin light (1px) |

Never applied to all cards — only interactive or overlay elements.

---

## UI polish (`make-interfaces-feel-better`)

- `active:scale-[0.96]` on all clickables
- `transition-[prop,...]` without `all`
- `text-wrap: balance` on h1–h4
- `text-wrap: pretty` on p, li
- `tabular-nums` for numbers
- Concentric radii (24→16→8)
- Shadows instead of borders

---

## Overall vibe

> *Современный, спокойный, технологичный, лёгкий, дружелюбный, минималистичный, премиальный, ориентированный на поколение Z и молодых специалистов.*
