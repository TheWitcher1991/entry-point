import { api } from "@shared/api/axios";
import type { Participation } from "../model/types";

export async function getMyParticipations(): Promise<Participation[]> {
  const { data } = await api.get<Participation[]>("/participations/my");
  return data;
}
