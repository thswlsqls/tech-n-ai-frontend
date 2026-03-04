export interface ApiResponse<T> {
  code: string;
  messageCode: { code: string; text: string };
  message?: string;
  data?: T;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: string;
}
