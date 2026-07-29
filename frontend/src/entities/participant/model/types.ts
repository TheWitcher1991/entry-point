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
