import { authFetch, parseResponse, parseVoidResponse } from "@/lib/auth-fetch";
import type {
  AdminResponse,
  AdminCreateRequest,
  AdminUpdateRequest,
} from "@/types/admin";

const BASE = "/api/v1/auth/admin";

export async function fetchAdminAccounts(): Promise<AdminResponse[]> {
  const res = await authFetch(`${BASE}/accounts`);
  return parseResponse<AdminResponse[]>(res);
}

export async function fetchAdminDetail(
  adminId: number
): Promise<AdminResponse> {
  const res = await authFetch(`${BASE}/accounts/${adminId}`);
  return parseResponse<AdminResponse>(res);
}

export async function createAdminAccount(
  req: AdminCreateRequest
): Promise<AdminResponse> {
  const res = await authFetch(`${BASE}/accounts`, {
    method: "POST",
    body: JSON.stringify(req),
  });
  return parseResponse<AdminResponse>(res);
}

export async function updateAdminAccount(
  adminId: number,
  req: AdminUpdateRequest
): Promise<AdminResponse> {
  const res = await authFetch(`${BASE}/accounts/${adminId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
  return parseResponse<AdminResponse>(res);
}

export async function deleteAdminAccount(adminId: number): Promise<void> {
  const res = await authFetch(`${BASE}/accounts/${adminId}`, {
    method: "DELETE",
  });
  return parseVoidResponse(res);
}
