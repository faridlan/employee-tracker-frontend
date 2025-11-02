import type { Employee } from "../types/employee";

const BASE_URL = "/api";

export async function getAllEmployees(): Promise<Employee[]> {
  const response = await fetch(`${BASE_URL}/employees`);
  if (!response.ok) throw new Error("Failed to fetch employees");
  return response.json();
}

export async function createEmployee(
  employee: Omit<Employee, "id" | "created_at" | "updated_at" | "targets">
): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  if (!response.ok) throw new Error("Failed to create employee");
  return response.json();
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${id}`);
  if (!response.ok) throw new Error("Failed to fetch employee");
  return response.json();
}
