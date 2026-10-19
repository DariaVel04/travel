import { ApiError } from '@/services/api/apiClient';

export type AuthErrorKey =
  | 'auth.errors.invalidCredentials'
  | 'auth.errors.emailTaken'
  | 'auth.errors.invalidInput'
  | 'auth.errors.unavailable'
  | 'auth.errors.currentPassword'
  | 'auth.errors.generic';

export function authErrorKey(error: unknown): AuthErrorKey {
  if (error instanceof ApiError) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return error.status === 401 && error.message.toLowerCase().includes('current')
        ? 'auth.errors.currentPassword'
        : 'auth.errors.invalidCredentials';
    }
    if (error.code === 'EMAIL_TAKEN') return 'auth.errors.emailTaken';
    if (error.code === 'VALIDATION_ERROR') return 'auth.errors.invalidInput';
    if (error.status === 503 || error.code === 'SERVICE_UNAVAILABLE') return 'auth.errors.unavailable';
  }

  if (error instanceof TypeError) return 'auth.errors.unavailable';
  return 'auth.errors.generic';
}
