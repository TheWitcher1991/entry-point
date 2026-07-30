import { api } from "@shared/api/axios";

export interface AdminTask {
  id: number;
  company_id: number;
  title: string;
  summary: string | null;
  difficulty: string | null;
  status: string;
  company_name: string | null;
  created_at: string;
}

export async function getAdminTasks(params?: {
  status?: string;
  skip?: number;
  limit?: number;
}): Promise<AdminTask[]> {
  const { data } = await api.get<AdminTask[]>("/admin/tasks", { params });
  return data;
}

export async function updateTaskStatus(
  taskId: number,
  status: string,
): Promise<void> {
  await api.patch(`/tasks/${taskId}/status`, { status });
}
