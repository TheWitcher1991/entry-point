export interface TaskSkill {
  id: number;
  task_id: number;
  skill_id: number;
  skill_name: string | null;
  level: string | null;
  is_required: boolean;
}

export interface TaskSkillCreate {
  skill_id: number;
  level: string | null;
  is_required: boolean;
}

export interface Task {
  id: number;
  company_id: number;
  company_name: string | null;
  title: string;
  summary: string | null;
  description: string | null;
  category_id: number | null;
  difficulty: string | null;
  format: string | null;
  start_date: string | null;
  deadline: string | null;
  participant_limit: number;
  participant_count: number;
  status: TaskStatus;
  expected_result: string | null;
  acceptance_criteria: string | null;
  requirements: string | null;
  advantages: string | null;
  materials_links: string | null;
  restrictions: string | null;
  allowed_tools: string | null;
  career_opportunities: string | null;
  portfolio_policy: string | null;
  ip_policy: string | null;
  confidentiality_policy: string | null;
  created_at: string;
  updated_at: string;
  skills: TaskSkill[];
}

export type TaskStatus =
  | "draft"
  | "moderation"
  | "revision"
  | "published"
  | "open"
  | "selected"
  | "in_progress"
  | "review"
  | "rework"
  | "completed"
  | "cancelled"
  | "archived"
  | "blocked";

export type TaskDifficulty = "beginner" | "intermediate" | "advanced";
export type TaskFormat = "remote" | "mixed" | "onsite";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Черновик",
  moderation: "На модерации",
  revision: "Требует доработки",
  published: "Опубликована",
  open: "Набор участников",
  selected: "Исполнитель выбран",
  in_progress: "В работе",
  review: "Результат на проверке",
  rework: "На доработке",
  completed: "Завершена",
  cancelled: "Отменена",
  archived: "Архивирована",
  blocked: "Заблокирована",
};

export const TASK_DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  beginner: "Для начинающих",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

export const TASK_FORMAT_LABELS: Record<TaskFormat, string> = {
  remote: "Удалённо",
  mixed: "Гибрид",
  onsite: "В офисе",
};

export interface TaskCreatePayload {
  title: string;
  summary?: string | null;
  description?: string | null;
  category_id?: number | null;
  difficulty?: string | null;
  format?: string | null;
  start_date?: string | null;
  deadline?: string | null;
  participant_limit?: number;
  expected_result?: string | null;
  acceptance_criteria?: string | null;
  requirements?: string | null;
  advantages?: string | null;
  materials_links?: string | null;
  restrictions?: string | null;
  allowed_tools?: string | null;
  career_opportunities?: string | null;
  portfolio_policy?: string | null;
  ip_policy?: string | null;
  confidentiality_policy?: string | null;
  skills?: TaskSkillCreate[];
}

export interface TaskUpdatePayload extends Partial<TaskCreatePayload> {}

export interface TaskListItem {
  id: number;
  company_id: number;
  company_name: string | null;
  title: string;
  summary: string | null;
  category_id: number | null;
  difficulty: string | null;
  format: string | null;
  deadline: string | null;
  participant_limit: number;
  participant_count: number;
  status: TaskStatus;
  career_opportunities: string | null;
  created_at: string;
  skills: TaskSkill[];
}
