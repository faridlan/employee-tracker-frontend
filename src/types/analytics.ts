export interface EmployeePerformance {
  month: string | number;
  target: number;
  achievement: number;
  percentage: number;
}

export interface ProductSummary {
  product_id: string;
  product_name: string;
  total_nominal: number;
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
