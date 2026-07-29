import { api } from "@shared/api/axios";
import type { Task } from "@entities/task";

export async function fetchTasks(filters?: Record<string, string>): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks", { params: filters });
  return data;
}
