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

/** ✅ Update employee — returns updated employee */
export async function updateEmployee(
  id: string,
  data: { name: string; position: string; office_location: string }
): Promise<Employee> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update employee");
  return response.json();
}

/** ✅ Soft delete employee */
export async function deleteEmployee(id: string): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete employee");
  return response.json();
}
