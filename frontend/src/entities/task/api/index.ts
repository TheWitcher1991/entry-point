import { api } from "@shared/api/axios";
import type { Task, TaskCreatePayload, TaskListItem, TaskUpdatePayload } from "../model";

export async function getTasks(params?: {
  status?: string;
  category_id?: number;
  company_id?: number;
  difficulty?: string;
  format?: string;
  search?: string;
  sort?: string;
  offset?: number;
  limit?: number;
}): Promise<TaskListItem[]> {
  const { data } = await api.get<TaskListItem[]>("/tasks", { params });
  return data;
}

export async function getTask(id: number): Promise<Task> {
  const { data } = await api.get<Task>(`/tasks/${id}`);
  return data;
}

export async function getMyCompanyTasks(): Promise<TaskListItem[]> {
  const { data } = await api.get<TaskListItem[]>("/tasks/my");
  return data;
}

export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const { data } = await api.post<Task>("/tasks", payload);
  return data;
}

export async function updateTask(
  id: number,
  payload: TaskUpdatePayload,
): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(
  id: number,
  status: string,
): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
  return data;
}
