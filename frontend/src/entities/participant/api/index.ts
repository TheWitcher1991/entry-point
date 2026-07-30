import { api } from "@shared/api/axios";
import type { Review } from "@entities/review";
import type { CompletedTask, ParticipantProfile, ParticipantProfileUpdate } from "../model";

export async function getProfile(): Promise<ParticipantProfile> {
  const { data } = await api.get<ParticipantProfile>("/participants/me");
  return data;
}

export async function updateProfile(
  payload: ParticipantProfileUpdate,
): Promise<ParticipantProfile> {
  const { data } = await api.patch<ParticipantProfile>(
    "/participants/me",
    payload,
  );
  return data;
}

export async function getCompletedTasks(): Promise<CompletedTask[]> {
  const { data } = await api.get<CompletedTask[]>("/participants/me/completed");
  return data;
}

export async function getParticipantPublicProfile(
  id: number,
): Promise<ParticipantProfile> {
  const { data } = await api.get<ParticipantProfile>(`/participants/${id}`);
  return data;
}

export async function getParticipantPublicReviews(
  id: number,
): Promise<Review[]> {
  const { data } = await api.get<Review[]>(`/participants/${id}/reviews`);
  return data;
}
