import { api } from "@shared/api/axios";
import type { Category } from "../model";

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/directories/categories");
  return data;
}

export async function createCategory(payload: {
  name: string;
  direction?: string;
}): Promise<Category> {
  const { data } = await api.post<Category>("/directories/categories", payload);
  return data;
}

export async function updateCategory(
  id: number,
  payload: { name?: string; direction?: string; is_active?: boolean },
): Promise<Category> {
  const { data } = await api.patch<Category>(`/directories/categories/${id}`, payload);
  return data;
}
