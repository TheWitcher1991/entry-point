export interface Submission {
  id: number;
  task_id: number;
  participant_id: number;
  description: string | null;
  result_links: string | null;
  status: SubmissionStatus;
  review_comment: string | null;
  created_at: string;
  updated_at: string;
  participant_first_name: string | null;
  participant_last_name: string | null;
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "На проверке",
  approved: "Принято",
  rejected: "На доработке",
};

export interface SubmissionCreatePayload {
  description?: string | null;
  result_links?: string | null;
}

export interface SubmissionReviewPayload {
  status: "approved" | "rejected";
  review_comment?: string | null;
}
