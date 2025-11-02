import type { Achievement } from "../types/achievement";

const BASE_URL = "/api";

async function handleResponse(res: Response, fallbackMsg: string) {
  if (!res.ok) {
    let msg = fallbackMsg;
    try {
      const data = await res.json();
      if (data?.message) {
        msg = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      } else if (typeof data === "string") {
        msg = data;
      }
    } catch {
      const txt = await res.text();
      msg = txt || res.statusText;
    }
    throw new Error(msg);
  }
  return res.json();
}

// 🧩 Get all achievements
export async function getAllAchievements(): Promise<Achievement[]> {
  const res = await fetch(`${BASE_URL}/achievements`);
  return handleResponse(res, "Failed to fetch achievements");
}

// 🧩 Create new achievement
export async function createAchievement(
  achievement: Omit<Achievement, "id" | "created_at" | "updated_at" | "target">
): Promise<Achievement> {
  const res = await fetch(`${BASE_URL}/achievements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(achievement),
  });
  return handleResponse(res, "Failed to create achievement");
}

// 🧩 Update existing achievement (by target_id)
export async function updateAchievement(
  targetId: string,
  nominal: number
): Promise<Achievement> {
  const res = await fetch(`${BASE_URL}/achievements/${targetId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_id: targetId, nominal }),
  });
  return handleResponse(res, "Failed to update achievement");
}
