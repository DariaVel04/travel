import { apiRequest } from './apiClient';
import type { PublicUser } from './types';

export function getCurrentUser(): Promise<PublicUser> {
  return apiRequest<PublicUser>('/api/auth/me');
}

export function updateCurrentUser(body: { name?: string; email?: string }): Promise<PublicUser> {
  return apiRequest<PublicUser>('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function changeCurrentUserPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiRequest<void>('/api/users/me/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}
