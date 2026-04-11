export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    accessToken: string;
    refreshToken: string;
  };
  error: {
    code: number;
    message: string;
    details: string;
  };
  timestamp: string;
  status: number;
}