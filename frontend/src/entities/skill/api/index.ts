import { api } from "@shared/api/axios";
import type { Skill } from "../model";

export async function getSkills(): Promise<Skill[]> {
  const { data } = await api.get<Skill[]>("/directories/skills");
  return data;
}

export async function createSkill(payload: {
  name: string;
  category_id?: number | null;
}): Promise<Skill> {
  const { data } = await api.post<Skill>("/directories/skills", payload);
  return data;
}

export async function updateSkill(
  id: number,
  payload: { name?: string; category_id?: number | null; is_active?: boolean },
): Promise<Skill> {
  const { data } = await api.patch<Skill>(`/directories/skills/${id}`, payload);
  return data;
}
