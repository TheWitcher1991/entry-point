import { api } from "@shared/api/axios";
import type { Review, ReviewCreatePayload } from "../model/types";

export async function createReview(
  taskId: number,
  submissionId: number,
  payload: ReviewCreatePayload,
): Promise<Review> {
  const { data } = await api.post<Review>(
    `/tasks/${taskId}/submissions/${submissionId}/review`,
    payload,
  );
  return data;
}

export async function getCompanyReviews(
  companyId: number,
): Promise<Review[]> {
  const { data } = await api.get<Review[]>(
    `/companies/${companyId}/reviews`,
  );
  return data;
}

export async function getMyReviews(): Promise<Review[]> {
  const { data } = await api.get<Review[]>("/participants/me/reviews");
  return data;
}
