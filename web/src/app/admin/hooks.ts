'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { ensureAdmin } from './auth';
import type { User } from '@/types/api';

export type UserRole =
  | 'customer'
  | 'vendor_manager'
  | 'rider'
  | 'admin'
  | 'support'
  | 'finance';

interface UseAdminUsersResult {
  loading: boolean;
  users: User[];
  error: string | null;
  updatingIds: Set<string>;
  reload: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
}

export function useAdminUsers(): UseAdminUsersResult {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const context = await ensureAdmin(router);
      if (!context) {
        return;
      }

      const data = await api.get<User[]>('/admin/users', context.token);
      setUsers(data ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateUserRole = async (userId: string, role: UserRole) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      router.replace('/auth/login');
      return;
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.add(userId);
      return next;
    });

    try {
      const updated = await api.patch<User>(
        `/admin/users/${userId}/role`,
        { role },
        token,
      );

      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user)),
      );
      toast.success('User role updated.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update user role';
      toast.error(message);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return {
    loading,
    users,
    error,
    updatingIds,
    reload: load,
    updateUserRole,
  };
}
