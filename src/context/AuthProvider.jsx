import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.fetchMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    if (data?.user) setUser(data.user);
    else await refreshUser();
    return data;
  }, [refreshUser]);

  const register = useCallback(async (payload) => {
    const data = await authApi.register({
      ...payload,
      is_admin: false,
    });
    if (data?.user) setUser(data.user);
    else await refreshUser();
    return data;
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin),
      refreshUser,
      login,
      register,
      logout,
    }),
    [user, loading, refreshUser, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
