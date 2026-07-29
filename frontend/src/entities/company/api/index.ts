import { api } from "@shared/api/axios";
import type { Company, CompanyUpdate } from "../model";

export async function getCompany(): Promise<Company> {
  const { data } = await api.get<Company>("/companies/me");
  return data;
}

export async function updateCompany(
  payload: CompanyUpdate,
): Promise<Company> {
  const { data } = await api.patch<Company>("/companies/me", payload);
  return data;
}
