export interface User {
  email: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface OTPState {
  email: string;
  otp: string;
  expiresAt: number;
  isExpired: boolean;
  attempts: number;
}