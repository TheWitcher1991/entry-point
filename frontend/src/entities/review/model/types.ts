export interface Review {
  id: number;
  submission_id: number;
  company_id: number;
  participant_id: number;
  task_id: number;
  rating: number;
  text: string | null;
  skills_confirmed: string | null;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  participant_first_name: string | null;
  participant_last_name: string | null;
  task_title: string | null;
}

export interface ReviewCreatePayload {
  rating: number;
  text?: string | null;
  skills_confirmed?: string | null;
}
