import { api } from "@shared/api/axios";
import type { Company, CompanyListItem, CompanyUpdate } from "../model";

export async function getCompanies(params?: {
  search?: string;
  offset?: number;
  limit?: number;
}): Promise<CompanyListItem[]> {
  const { data } = await api.get<CompanyListItem[]>("/companies", { params });
  return data;
}

export async function getCompany(): Promise<Company> {
  const { data } = await api.get<Company>("/companies/me");
  return data;
}

export async function getCompanyById(id: number): Promise<Company> {
  const { data } = await api.get<Company>(`/companies/${id}`);
  return data;
}

export async function updateCompany(
  payload: CompanyUpdate,
): Promise<Company> {
  const { data } = await api.patch<Company>("/companies/me", payload);
  return data;
}
