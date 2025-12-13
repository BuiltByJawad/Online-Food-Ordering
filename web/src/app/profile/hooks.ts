'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/auth';
import type { User } from '@/types/api';
import { profileSchema, type ProfileFormValues } from './schemas';
import { fetchProfile, updateProfile } from './services/profile';
export { useAddresses } from './addresses/hooks/useAddresses';

export function useProfileForm() {
  const token = getAccessToken();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    fetchProfile(token)
      .then((data) => {
        setProfile(data);
        form.reset({
          name: data.name ?? '',
          phone: data.phone ?? '',
        });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load profile';
        toast.error(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [form, token]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      const data = await updateProfile(
        {
          name: values.name || undefined,
          phone: values.phone || undefined,
        },
        token,
      );
      setProfile(data);
      toast.success('Profile updated.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    }
  });

  return { profile, loading, form, handleSubmit };
}

