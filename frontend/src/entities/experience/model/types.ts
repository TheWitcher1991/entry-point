export interface VerifiedSkill {
  id: number;
  experience_id: number;
  skill_name: string;
}

export interface VerifiedExperience {
  id: number;
  participant_id: number;
  task_id: number;
  company_id: number;
  review_id: number;
  task_title: string;
  company_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  skills: VerifiedSkill[];
}

export interface VerifiedExperienceListItem {
  id: number;
  participant_id: number;
  task_id: number;
  company_id: number;
  task_title: string;
  company_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  skills: VerifiedSkill[];
}
