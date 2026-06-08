import type { AdminUser } from "@/types/auth";
import { authFetch, parseResponse, parseVoidResponse } from "@/lib/auth-fetch";

const BFF_BASE = "/api/bff/auth";

/**
 * Admin login via BFF — tokens are stored in HttpOnly cookies server-side.
 * Returns user info only (no tokens exposed to client).
 * Uses raw fetch (not authFetch) since there is no token to attach yet
 * and a 401 here must not trigger the refresh-and-retry flow.
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<{ user: AdminUser }> {
  const res = await fetch(`${BFF_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<{ user: AdminUser }>(res);
}

export async function logout(): Promise<void> {
  const res = await authFetch(`${BFF_BASE}/logout`, { method: "POST" });
  return parseVoidResponse(res);
}
