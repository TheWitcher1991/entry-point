export interface CompanyListItem {
  id: number;
  name: string | null;
  description: string | null;
  city: string | null;
  industry: string | null;
  stack: string | null;
  company_size: string | null;
  verification_status: string;
  logo_url: string | null;
  created_at: string;
}

export interface Company {
  id: number;
  owner_id: number;
  name: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  city: string | null;
  industry: string | null;
  company_size: string | null;
  stack: string | null;
  contact_name: string | null;
  contact_position: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

/** Поля, которые можно отправить на PATCH /companies/me */
export type CompanyUpdate = Partial<
  Pick<
    Company,
    | "name"
    | "logo_url"
    | "description"
    | "website"
    | "city"
    | "industry"
    | "company_size"
    | "stack"
    | "contact_name"
    | "contact_position"
  >
>;
