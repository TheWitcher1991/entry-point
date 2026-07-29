import { api } from "@shared/api/axios";
import type { Category } from "../model";

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/directories/categories");
  return data;
}
