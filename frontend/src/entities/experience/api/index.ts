import { api } from "@shared/api/axios";
import type { VerifiedExperience, VerifiedExperienceListItem } from "../model/types";

export async function getMyExperiences(): Promise<VerifiedExperienceListItem[]> {
  const { data } = await api.get<VerifiedExperienceListItem[]>("/participants/me/experiences");
  return data;
}

export async function getParticipantExperiences(
  participantId: number,
): Promise<VerifiedExperienceListItem[]> {
  const { data } = await api.get<VerifiedExperienceListItem[]>(
    `/participants/${participantId}/experiences`,
  );
  return data;
}

export async function getExperience(
  experienceId: number,
): Promise<VerifiedExperience> {
  const { data } = await api.get<VerifiedExperience>(`/experiences/${experienceId}`);
  return data;
}
