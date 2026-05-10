import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "@/types";

export type { LoginCredentials, RegisterData, AuthResponse, User };

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
