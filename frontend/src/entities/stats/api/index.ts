import { api } from "@shared/api/axios";
import type { Stats } from "../model/types";

export async function getStats(): Promise<Stats> {
  const { data } = await api.get<Stats>("/stats");
  return data;
}
