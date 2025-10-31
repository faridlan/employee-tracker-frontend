import type { Target } from "./target";
export interface Employee {
  id: string;
  name: string;
  position: string;
  office_location: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  targets: Target[];
}
