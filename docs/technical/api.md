# API Reference

> BASE: `http://localhost:8000/api/v1`

Interactive docs: [`/docs`](http://localhost:8000/docs) (Swagger), [`/redoc`](http://localhost:8000/redoc)

---

## Public endpoints (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/v1/stats` | Platform statistics |
| GET | `/api/v1/tasks` | List tasks (filters, pagination, sorting) |
| GET | `/api/v1/tasks/{id}` | Task details |
| GET | `/api/v1/companies` | List companies |
| GET | `/api/v1/companies/{id}` | Company public profile |
| GET | `/api/v1/companies/{id}/reviews` | Company reviews |
| GET | `/api/v1/participants/{id}` | Participant public profile |
| GET | `/api/v1/participants/{id}/reviews` | Participant reviews |
| GET | `/api/v1/directories/skills` | Skills reference |
| GET | `/api/v1/directories/categories` | Categories reference |
| POST | `/api/v1/auth/register` | Registration |
| POST | `/api/v1/auth/login` | Login |

### Query parameters — `GET /api/v1/tasks`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `open` | Filter by status |
| `category_id` | int | — | Filter by category |
| `company_id` | int | — | Filter by company |
| `difficulty` | string | — | `beginner`, `intermediate`, `advanced` |
| `format` | string | — | `remote`, `onsite`, `mixed` |
| `search` | string | — | Search in title/summary (min 2 chars) |
| `sort` | string | `newest` | `newest`, `deadline`, `popular` |
| `offset` | int | `0` | Pagination offset |
| `limit` | int | `20` | Items per page (max 100) |

---

## Participant endpoints (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/participants/me` | My profile |
| PATCH | `/api/v1/participants/me` | Update my profile |
| GET | `/api/v1/participants/me/completed` | Completed tasks |
| POST | `/api/v1/applications` | Apply to a task |
| GET | `/api/v1/applications/my` | My applications |
| POST | `/api/v1/tasks/{id}/submit` | Submit work |
| GET | `/api/v1/participations/my` | My active participations |
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Unread count |
| PATCH | `/api/v1/notifications/{id}/read` | Mark as read |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read |

---

## Company endpoints (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/companies/me` | My company profile |
| PATCH | `/api/v1/companies/me` | Update my profile |
| POST | `/api/v1/tasks` | Create task |
| PATCH | `/api/v1/tasks/{id}` | Update task |
| GET | `/api/v1/tasks/my` | My company's tasks |
| GET | `/api/v1/tasks/{id}/submissions` | Submissions for a task |
| GET | `/api/v1/tasks/{id}/participants` | Participants of a task |
| PATCH | `/api/v1/tasks/{id}/submissions/{id}/review` | Review submission |
| PATCH | `/api/v1/tasks/{id}/status` | Change task status |
| GET | `/api/v1/applications/company` | All applications for my tasks |
| GET | `/api/v1/applications/task/{id}` | Applications for a specific task |
| PATCH | `/api/v1/applications/{id}/status` | Approve/reject application |
| POST | `/api/v1/tasks/{id}/submissions/{id}/review` | Create review |

---

## Admin endpoints (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| PATCH | `/api/v1/admin/users/{id}/status` | Block/unblock user |
| GET | `/api/v1/admin/tasks` | All tasks (moderation) |
| PATCH | `/api/v1/tasks/{id}/status` | Moderate task status |
| PATCH | `/api/v1/admin/applications/{id}/status` | Moderate application |

---

## Common schemas

### Task statuses

```
draft → moderation → open → selected → in_progress → review → completed
                                                              → rework
```

### Application statuses

```
pending → approved → in_progress → completed
       → rejected
       → withdrawn
```

### Participation statuses

```
active → completed
```

### Submission statuses

```
pending → approved → (review created automatically)
       → rejected
```

---

## Error responses

All errors return a JSON body:

```json
{
  "detail": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Missing or invalid token |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Auth

```http
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securepass",
  "role": "participant"  // "participant" | "company"
}
```

```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "securepass"
}
// Response: { "access_token": "...", "user_id": 1 }
```

All protected endpoints require:

```http
Authorization: Bearer <access_token>
```
