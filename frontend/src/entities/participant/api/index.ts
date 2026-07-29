import { api } from "@shared/api/axios";
import type { ParticipantProfile, ParticipantProfileUpdate } from "../model";

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
