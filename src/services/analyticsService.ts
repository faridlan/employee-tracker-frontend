import type { EmployeePerformance, ProductSummary } from "../types/analytics";

const BASE_URL = "http://localhost:3000";

export async function getEmployeePerformance(
  employeeId: string
): Promise<EmployeePerformance[]> {
  const res = await fetch(
    `${BASE_URL}/analytics/employee/${employeeId}/performance`
  );
  if (!res.ok) throw new Error("Failed to fetch employee performance");
  return res.json();
}

export async function getProductTargetSummary(): Promise<ProductSummary[]> {
  const res = await fetch(`${BASE_URL}/analytics/products/targets`);
  if (!res.ok) throw new Error("Failed to fetch product target summary");
  return res.json();
}
