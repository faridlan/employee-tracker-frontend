import type { Target } from "../types/target";

const BASE_URL = "/api";

export async function getAllTargets(): Promise<Target[]> {
  const res = await fetch(`${BASE_URL}/targets`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch targets: ${txt || res.statusText}`);
  }
  return res.json();
}

export async function createTarget(
  target: Omit<
    Target,
    "id" | "created_at" | "updated_at" | "employee" | "Product" | "Achievement"
  >
): Promise<Target> {
  const res = await fetch(`${BASE_URL}/targets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  });

  if (!res.ok) {
    // 🧠 Try to parse JSON error
    let errorMessage = "Failed to create target";
    try {
      const data = await res.json();
      if (data?.message) {
        if (Array.isArray(data.message)) errorMessage = data.message.join(", ");
        else errorMessage = data.message;
      } else if (typeof data === "string") {
        errorMessage = data;
      }
    } catch {
      // fallback if body isn’t JSON
      const txt = await res.text();
      errorMessage = txt || res.statusText;
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

export class NotFoundError extends Error {}

export async function getTargetsByEmployee(
  employeeId: string
): Promise<Target[]> {
  const res = await fetch(`${BASE_URL}/targets/employee/${employeeId}`, {
    method: "GET",
  });

  if (res.status === 404) {
    // keep throwing so UI can detect and show friendly message
    throw new NotFoundError("No targets found for this employee");
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch targets: ${txt || res.statusText}`);
  }

  return res.json();
}
