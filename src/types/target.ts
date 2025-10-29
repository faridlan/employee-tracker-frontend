import type { Employee } from "./employee";
import type { Product } from "./product";

export interface Achievement {
  id: string;
  target_id: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface Target {
  id: string;
  employee_id: string;
  product_id: string;
  nominal: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  Product?: Product;
  Achievement?: Achievement | null;
}
