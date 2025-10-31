import type { Target } from "./target";

export interface Achievement {
  id: string;
  target_id: string;
  nominal: number;
  created_at: string;
  updated_at: string;
  target?: Target; // includes employee, product, etc.
}

export interface AchievementQuery {
  page?: number;
  limit?: number;
  search?: string;
  month?: number;
  year?: number;
  employeeId?: string;
  productId?: string;
}

export interface PaginatedAchievements {
  data: Achievement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
