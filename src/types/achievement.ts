import type { Target } from "./target";

export interface Achievement {
  id: string;
  target_id: string;
  nominal: number;
  created_at: string;
  updated_at: string;
  target?: Target; // includes employee, product, etc.
}
