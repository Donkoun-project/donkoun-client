export interface IUserProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  roleId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserProfileResponse {
  success: boolean;
  data: IUserProfile;
  message: string;
}

export interface IUpdateUserProfileRequest {
  fullName: string;
  email: string;
  phone: string;
}

export interface IUpdateUserProfileResponse {
  success: boolean;
  message: string;
  data: IUserProfile;
  error: {
    code: number;
    message: string;
    details: string;
  };
  timestamp: string;
  status: number;
}