import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { paths } from '@/app/paths';
import {
  changeAccountPassword,
  fetchCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateAccountProfile,
  type LoginPayload,
  type RegisterPayload,
} from '../services/authApi';
import type { CurrentUser } from '../types';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void fetchCurrentUser()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const current = await loginAccount(payload);
    setUser(current);
    return current;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const current = await registerAccount(payload);
    setUser(current);
    return current;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAccount();
    } catch {
      // Session is cleared locally even if the API is unreachable.
    }
    setUser(null);
    navigate(paths.home);
  }, [navigate]);

  const updateProfile = useCallback(async (payload: { name?: string; email?: string }) => {
    const current = await updateAccountProfile(payload);
    setUser(current);
    return current;
  }, []);

  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      await changeAccountPassword(payload);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, isLoading, login, register, logout, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
