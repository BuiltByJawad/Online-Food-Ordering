'use client';

import { toast } from 'sonner';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { User } from '@/types/api';

export interface AdminContext {
  token: string;
  user: User;
}

export async function ensureAdmin(
  router: { replace: (href: string) => void },
): Promise<AdminContext | null> {
  const token = getAccessToken();

  if (!token) {
    toast.error('You are not logged in.');
    router.replace('/auth/login');
    return null;
  }

  try {
    const user = await fetchCurrentUser(token);

    if (user.role !== 'admin') {
      toast.error('You do not have access to the admin portal.');
      router.replace('/');
      return null;
    }

    return { token, user };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to verify admin user';
    toast.error(message);
    return null;
  }
}
