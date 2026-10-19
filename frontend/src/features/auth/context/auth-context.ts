import { createContext } from 'react';
import type { LoginPayload, RegisterPayload } from '../services/authApi';
import type { CurrentUser } from '../types';

export interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<CurrentUser>;
  register: (payload: RegisterPayload) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name?: string; email?: string }) => Promise<CurrentUser>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
