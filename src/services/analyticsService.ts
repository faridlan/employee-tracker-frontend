import type { EmployeePerformance, ProductSummary } from "../types/analytics";
import type { MonthlySummary } from "../types/analytics";

const BASE_URL = "/api";

export async function getEmployeePerformance(
  employeeId: string,
  year?: number,
  productId?: string // 🆕 optional product filter
): Promise<EmployeePerformance[]> {
  // 🧭 Build query parameters dynamically
  const params = new URLSearchParams();
  if (year !== undefined) params.append("year", String(year));
  if (productId !== undefined) params.append("productId", productId);

  // 🧱 Construct the full URL
  const url = `${BASE_URL}/analytics/employee/${employeeId}/performance${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  // 🚀 Fetch data
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch employee performance");
  return res.json();
}

export async function getProductTargetSummary(
  year?: number
): Promise<ProductSummary[]> {
  const url = year
    ? `${BASE_URL}/analytics/products/targets?year=${year}`
    : `${BASE_URL}/analytics/products/targets`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch product target summary");
  return res.json();
}

export async function getAvailableYears(): Promise<number[]> {
  const res = await fetch(`${BASE_URL}/analytics/years`);
  if (!res.ok) throw new Error("Failed to fetch available years");
  return res.json();
}

export async function getOverallMonthlySummary(
  year?: number
): Promise<MonthlySummary[]> {
  const url = year
    ? `${BASE_URL}/analytics/summary/monthly?year=${year}`
    : `${BASE_URL}/analytics/summary/monthly`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch monthly summary");
  return res.json();
}

export async function getEmployeeDetail(employeeId: string) {
  const response = await fetch(`/api/employees/${employeeId}`);
  if (!response.ok) throw new Error("Failed to fetch employee info");
  return response.json();
}

export async function getMonthlySummaryByCategory(year?: number) {
  const url = year
    ? `${BASE_URL}/analytics/summary/monthly-by-category?year=${year}`
    : `${BASE_URL}/analytics/summary/monthly-by-category`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch category monthly summary");
  return res.json();
}
