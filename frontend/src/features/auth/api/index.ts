import { api } from "@shared/api/axios";

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data as { access_token: string };
}

export async function registerRequest(email: string, password: string, role: string) {
  const { data } = await api.post("/auth/register", { email, password, role });
  return data as { access_token: string };
}
