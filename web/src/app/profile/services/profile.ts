'use client';

import { api } from '@/lib/api';
import type { User } from '@/types/api';

export function fetchProfile(token: string) {
  return api.get<User>('/users/me', token);
}

export function updateProfile(
  values: { name?: string; phone?: string },
  token: string,
) {
  return api.patch<User>('/users/me', values, token);
}
