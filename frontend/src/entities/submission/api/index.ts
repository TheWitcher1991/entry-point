import { api } from "@shared/api/axios";
import type {
  Submission,
  SubmissionCreatePayload,
  SubmissionReviewPayload,
} from "../model/types";

export async function submitTaskResult(
  taskId: number,
  payload: SubmissionCreatePayload,
): Promise<Submission> {
  const { data } = await api.post<Submission>(
    `/tasks/${taskId}/submit`,
    payload,
  );
  return data;
}

export async function getTaskSubmissions(
  taskId: number,
): Promise<Submission[]> {
  const { data } = await api.get<Submission[]>(
    `/tasks/${taskId}/submissions`,
  );
  return data;
}

export async function reviewSubmission(
  taskId: number,
  submissionId: number,
  payload: SubmissionReviewPayload,
): Promise<Submission> {
  const { data } = await api.patch<Submission>(
    `/tasks/${taskId}/submissions/${submissionId}/review`,
    payload,
  );
  return data;
}
