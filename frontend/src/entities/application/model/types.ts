export interface Application {
  id: number;
  task_id: number;
  participant_id: number;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  task_title: string | null;
  participant_first_name: string | null;
  participant_last_name: string | null;
}

export type ApplicationStatus =
  | "pending"
  | "review"
  | "approved"
  | "rejected"
  | "withdrawn";

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  review: "Проверяется",
  approved: "Одобрена",
  rejected: "Отклонена",
  withdrawn: "Отозвана",
};

export interface ApplicationCreatePayload {
  task_id: number;
  cover_letter?: string | null;
}

export interface ApplicationStatusUpdatePayload {
  status: ApplicationStatus;
}
