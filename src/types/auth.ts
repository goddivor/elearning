export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}