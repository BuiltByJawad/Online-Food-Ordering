'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  status: string;
}

const schema = z.object({
  name: z.string().max(255, 'Name is too long').optional().or(z.literal('')),
  phone: z.string().max(32, 'Phone is too long').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null;

    if (!token) {
      toast.error('You are not logged in.');
      setLoading(false);
      return;
    }

    api
      .get<UserProfile>('/users/me', token)
      .then((data) => {
        setProfile(data);
        reset({
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
  }, [reset]);

  const onSubmit = async (values: FormValues) => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null;

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      const data = await api.patch<UserProfile>(
        '/users/me',
        { name: values.name || undefined, phone: values.phone || undefined },
        token,
      );
      setProfile(data);
      toast.success('Profile updated.');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        {profile && (
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <span className="font-medium">{profile.email}</span>
          </p>
        )}

        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone
            </label>
            <input
              type="tel"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Manage addresses in{' '}
          <a
            href="/profile/addresses"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Address Book
          </a>
        </p>
      </div>
    </div>
  );
}
