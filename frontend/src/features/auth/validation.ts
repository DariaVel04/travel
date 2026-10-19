export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthMessageKey =
  | 'auth.validation.nameRequired'
  | 'auth.validation.nameTooLong'
  | 'auth.validation.emailRequired'
  | 'auth.validation.emailInvalid'
  | 'auth.validation.passwordRequired'
  | 'auth.validation.passwordMin'
  | 'auth.validation.passwordMax'
  | 'auth.validation.confirmRequired'
  | 'auth.validation.passwordMismatch'
  | 'auth.validation.currentPasswordRequired';

export type FieldErrors = Partial<Record<string, AuthMessageKey>>;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateName(value: string): AuthMessageKey | undefined {
  const name = value.trim();
  if (!name) return 'auth.validation.nameRequired';
  if (name.length > 80) return 'auth.validation.nameTooLong';
  return undefined;
}

export function validateEmail(value: string): AuthMessageKey | undefined {
  const email = value.trim();
  if (!email) return 'auth.validation.emailRequired';
  if (!isValidEmail(email)) return 'auth.validation.emailInvalid';
  return undefined;
}

export function validatePassword(value: string): AuthMessageKey | undefined {
  if (!value) return 'auth.validation.passwordRequired';
  if (value.length < MIN_PASSWORD_LENGTH) return 'auth.validation.passwordMin';
  if (value.length > 72) return 'auth.validation.passwordMax';
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): AuthMessageKey | undefined {
  if (!confirm) return 'auth.validation.confirmRequired';
  if (password !== confirm) return 'auth.validation.passwordMismatch';
  return undefined;
}
