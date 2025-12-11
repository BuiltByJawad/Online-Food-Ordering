'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AuthResponse } from '@/types/api';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from './schemas';

export function useLoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    toast.dismiss();

    try {
      const data = await api.post<AuthResponse>('/auth/login', {
        email: values.email,
        password: values.password,
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', data.accessToken);
      }

      router.replace('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    }
  });

  return { form, handleSubmit };
}

export function useRegisterForm() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    toast.dismiss();

    try {
      const data = await api.post<AuthResponse>('/auth/register', {
        email: values.email,
        password: values.password,
        name: values.name || undefined,
        phone: values.phone || undefined,
      });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', data.accessToken);
      }

      router.replace('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    }
  });

  return { form, handleSubmit };
}
