export interface Participation {
  id: number;
  task_id: number;
  participant_id: number;
  status: string;
  created_at: string;
  task?: {
    id: number;
    title: string;
    summary: string | null;
    description: string | null;
    difficulty: string | null;
    deadline: string | null;
    status: string;
    company_name?: string;
    company_id?: number;
    skills?: Array<{ id: number; name: string; level?: string }>;
  };
}
