import { api } from "@shared/api/axios";
import type { Skill } from "../model";

export async function getSkills(): Promise<Skill[]> {
  const { data } = await api.get<Skill[]>("/directories/skills");
  return data;
}
