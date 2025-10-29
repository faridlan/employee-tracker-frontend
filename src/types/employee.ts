export interface Target {
  id: string;
  employee_id: string;
  product_id: string;
  nominal: number;
  date: string;
  created_at: string;
  updated_at: string;
}

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
