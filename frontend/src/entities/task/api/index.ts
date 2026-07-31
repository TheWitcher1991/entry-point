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

export interface TaskParticipant {
  id: number;
  participant_id: number;
  status: string;
  created_at: string;
  participant_first_name: string | null;
  participant_last_name: string | null;
  participant_avatar_url: string | null;
}

export async function getSavedTaskIds(): Promise<number[]> {
  const { data } = await api.get<number[]>("/tasks/bookmarks");
  return data;
}

export async function getSavedTasks(): Promise<TaskListItem[]> {
  const { data } = await api.get<TaskListItem[]>("/tasks/bookmarks/detail");
  return data;
}

export async function toggleBookmark(taskId: number): Promise<void> {
  await api.post(`/tasks/${taskId}/bookmark`);
}

export async function getTaskParticipants(
  taskId: number,
): Promise<TaskParticipant[]> {
  const { data } = await api.get<TaskParticipant[]>(
    `/tasks/${taskId}/participants`,
  );
  return data;
}

export async function removeTaskParticipant(
  taskId: number,
  participantId: number,
): Promise<void> {
  await api.delete(`/tasks/${taskId}/participants/${participantId}`);
}

export async function updateTaskParticipantStatus(
  taskId: number,
  participantId: number,
  status: "active" | "completed",
): Promise<TaskParticipant> {
  const { data } = await api.patch<TaskParticipant>(
    `/tasks/${taskId}/participants/${participantId}/status`,
    { status },
  );
  return data;
}
