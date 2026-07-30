export type UserRole = "participant" | "company" | "admin";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status: string;
  /** Имя (для participant) */
  first_name?: string | null;
  /** Фамилия (для participant) */
  last_name?: string | null;
  /** Название компании (для company) */
  company_name?: string | null;
}
