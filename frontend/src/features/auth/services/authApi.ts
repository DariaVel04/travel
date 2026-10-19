import { apiRequest } from '@/services/api/apiClient';
import {
  changeCurrentUserPassword,
  getCurrentUser,
  updateCurrentUser,
} from '@/services/api/userApi';
import type { CurrentUser } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerAccount(body: RegisterPayload): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function loginAccount(body: LoginPayload): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logoutAccount(): Promise<void> {
  return apiRequest<void>('/api/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser(): Promise<CurrentUser> {
  return getCurrentUser();
}

export function updateAccountProfile(body: { name?: string; email?: string }): Promise<CurrentUser> {
  return updateCurrentUser(body);
}

export function changeAccountPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return changeCurrentUserPassword(body);
}
