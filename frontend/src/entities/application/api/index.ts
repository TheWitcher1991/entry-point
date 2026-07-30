import { api } from "@shared/api/axios";
import type {
  Application,
  ApplicationCreatePayload,
  ApplicationStatusUpdatePayload,
} from "../model/types";

export async function createApplication(
  payload: ApplicationCreatePayload,
): Promise<Application> {
  const { data } = await api.post<Application>("/applications", payload);
  return data;
}

export async function getMyApplications(): Promise<Application[]> {
  const { data } = await api.get<Application[]>("/applications/my");
  return data;
}

export async function getTaskApplications(
  taskId: number,
): Promise<Application[]> {
  const { data } = await api.get<Application[]>(
    `/applications/task/${taskId}`,
  );
  return data;
}

export async function getCompanyApplications(): Promise<Application[]> {
  const { data } = await api.get<Application[]>("/applications/company");
  return data;
}

export async function updateApplicationStatus(
  applicationId: number,
  payload: ApplicationStatusUpdatePayload,
): Promise<Application> {
  const { data } = await api.patch<Application>(
    `/applications/${applicationId}/status`,
    payload,
  );
  return data;
}
