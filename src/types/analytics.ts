export interface EmployeePerformance {
  month: string;
  year: number;
  product_id?: string | null;
  product_name?: string;
  target: number;
  achievement: number;
  percentage: number;
}

export interface ProductSummary {
  product_id: number;
  product_name: string;
  total_nominal: number;
  month: number;
  year: number;
}

export interface MonthlySummary {
  month: number;
  target: number;
  achievement: number;
  percentage: number;
}

export interface TopEmployee {
  employee_id: string;
  name: string;
  office_location: string;
  total_target: number;
  total_achievement: number;
  achievement_rate: number;
}
