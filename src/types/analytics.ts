export interface EmployeePerformance {
  month: string;
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
