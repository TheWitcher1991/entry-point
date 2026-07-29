import { api } from "@shared/api/axios";
import type { User } from "../model";

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}
