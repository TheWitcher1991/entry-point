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

export interface AdminCompany {
  id: number;
  owner_id: number;
  name: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  industry: string | null;
  company_size: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
  owner_email: string | null;
}

export interface AdminStats {
  total_users: number;
  participants: number;
  companies: number;
  verified_companies: number;
  company_users: number;
  admins: number;
  total_tasks: number;
  tasks_draft: number;
  tasks_moderation: number;
  tasks_published: number;
  tasks_open: number;
  tasks_in_progress: number;
  tasks_review: number;
  tasks_completed: number;
  tasks_blocked: number;
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

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}

export async function getAdminCompanies(): Promise<AdminCompany[]> {
  const { data } = await api.get<AdminCompany[]>("/admin/companies");
  return data;
}

export async function updateCompanyVerification(
  companyId: number,
  verificationStatus: string,
): Promise<void> {
  await api.patch(`/admin/companies/${companyId}/verification`, {
    verification_status: verificationStatus,
  });
}
