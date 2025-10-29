import type { Product } from "../types/product";

const BASE_URL = "http://localhost:3000";

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at" | "category">
): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}
