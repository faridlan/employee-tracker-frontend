// services/categoryService.ts
import type { TopEmployee } from "../types/analytics";
import type { Category } from "../types/product";

const BASE_URL = "/api";

export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(
  category: Omit<Category, "id" | "created_at" | "updated_at" | "products">
): Promise<Category> {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(
  id: string,
  data: Partial<Pick<Category, "name">>
): Promise<Category> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to update category");
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to delete category");
  }
}

export async function getTopEmployeesByAchievement(): Promise<TopEmployee[]> {
  const res = await fetch(`${BASE_URL}/analytics/employees/top-achievers`);
  if (!res.ok) throw new Error("Failed to fetch top employees");
  return res.json();
}
