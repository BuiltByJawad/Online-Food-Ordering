'use client';

import { api } from '@/lib/api';
import type { AuthResponse } from '@/types/api';
import type { LoginFormValues, RegisterFormValues } from '../schemas';

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', {
    email: values.email,
    password: values.password,
  });
}

export async function register(
  values: RegisterFormValues,
): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', {
    email: values.email,
    password: values.password,
    name: values.name || undefined,
    phone: values.phone || undefined,
  });
}
