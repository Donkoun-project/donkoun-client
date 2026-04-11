export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  data?: any;
}