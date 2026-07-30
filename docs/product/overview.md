# Product Overview

> **Точка входа** — цифровая платформа, на которой IT-компании публикуют небольшие реальные задачи, а студенты, выпускники и начинающие специалисты выполняют их и получают подтверждённый практический опыт.

---

## Core scenario

```
Company publishes a task
  → Participant applies
    → Company selects executor
      → Participant works in workspace
        → Company reviews & accepts
          → Participant gets confirmed experience
```

---

## What it is not

| Not this | Reason |
|----------|--------|
| Freelance exchange | Tasks are limited in scope, fixed price, no bidding |
| Job board | Companies select executers, not vice versa |
| Education platform | No courses, no curriculum — real work only |
| Internship aggregator | Tasks are independent, not tied to employment |

---

## Target audience

### Participants
- Students (3rd+ year) in IT/tech fields
- Bootcamp graduates needing portfolio projects
- Junior developers looking for verified experience

### Companies
- IT companies wanting to evaluate candidates before hiring
- Teams needing small features/SPIs/designs done
- Companies building employer brand among juniors

---

## Key principles

| Principle | Description |
|-----------|-------------|
| **Limited task** | Each task is small (3–10 days), with clear acceptance criteria |
| **Safety** | No IP transfer — company gets usage rights, participant keeps authorship |
| **Useful for participant** | Confirmed experience = review + skills confirmation + public profile card |
| **Free MVP** | No payments in MVP — motivation is experience and portfolio |

---

## Roles

| Role | Capabilities |
|------|-------------|
| **Participant** | Browse catalog, apply, work in workspace, submit results, get reviews |
| **Company** | Publish tasks, review applications, accept/reject submissions, write reviews |
| **Admin** | Moderate tasks, manage users, oversee platform |

---

## Status flows

### Task
```
draft → moderation → open → selected → in_progress → review → completed
                                                              → rework
```

### Application
```
pending → approved → in_progress → completed
       → rejected
       → withdrawn
```

### Submission
```
pending → approved (→ review created)
       → rejected
```

---

## What's in MVP

See [MVP scope](mvp.md) for the full breakdown.

- Registration & auth (3 roles)
- Participant & company profiles
- Task catalog (filters, search, pagination)
- Task lifecycle (CRUD, moderation, status transitions)
- Applications (apply, approve, reject)
- Workspace (task view + submission)
- Reviews (rating, text, confirmed skills)
- Notifications (in-app + email)
- Admin panel (task moderation, user management)
- Landing page with live stats

---

## What's NOT in MVP

Payments, commissions, subscriptions, AI recommendations, Kanban,
video calls, time tracking, integrations (hh.ru, GitHub, Jira),
mobile apps, SSO, full chat, file uploads, complaints.
