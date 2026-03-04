export interface AdminResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminCreateRequest {
  email: string;
  username: string;
  password: string;
}

export interface AdminUpdateRequest {
  username?: string;
  password?: string;
}
