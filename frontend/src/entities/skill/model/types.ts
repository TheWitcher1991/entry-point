export interface Skill {
  id: number;
  name: string;
  category_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
