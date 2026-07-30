export interface ParticipantProfile {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  education: string | null;
  specialty: string | null;
  graduation_year: number | null;
  desired_role: string | null;
  github_url: string | null;
  telegram: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  availability_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompletedTask {
  submission_id: number;
  task_id: number;
  task_title: string;
  task_summary: string | null;
  task_difficulty: string | null;
  company_name: string | null;
  description: string | null;
  result_links: string | null;
  review_comment: string | null;
  completed_at: string;
}

/** Поля, которые можно отправить на PATCH /participants/me */
export type ParticipantProfileUpdate = Partial<
  Pick<
    ParticipantProfile,
    | "first_name"
    | "last_name"
    | "avatar_url"
    | "city"
    | "bio"
    | "education"
    | "specialty"
    | "graduation_year"
    | "desired_role"
    | "github_url"
    | "telegram"
    | "portfolio_url"
    | "resume_url"
    | "availability_status"
  >
>;
