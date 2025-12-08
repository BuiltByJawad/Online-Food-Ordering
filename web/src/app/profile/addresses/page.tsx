'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode?: string;
  country: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

const schema = z.object({
  label: z.string().min(1, 'Label is required').max(64, 'Label is too long'),
  line1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 is too long'),
  line2: z.string().max(255, 'Address line 2 is too long').optional().or(z.literal('')),
  city: z.string().min(1, 'City is required').max(128, 'City is too long'),
  postalCode: z
    .string()
    .max(32, 'Postal code is too long')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(64, 'Country is too long'),
  lat: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Latitude must be a number',
    ),
  lng: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Number(val)),
      'Longitude must be a number',
    ),
  isDefault: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      line1: '',
      line2: '',
      city: '',
      postalCode: '',
      country: '',
      lat: '',
      lng: '',
      isDefault: false,
    },
  });

  const loadAddresses = () => {
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
      .get<Address[]>('/addresses', token)
      .then((data) => {
        setAddresses(data);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to load addresses';
        toast.error(message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAddresses();
  }, []);

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
      await api.post<Address>(
        '/addresses',
        {
          label: values.label,
          line1: values.line1,
          line2: values.line2 || undefined,
          city: values.city,
          postalCode: values.postalCode || undefined,
          country: values.country,
          lat: values.lat ? Number(values.lat) : undefined,
          lng: values.lng ? Number(values.lng) : undefined,
          isDefault: values.isDefault ?? false,
        },
        token,
      );

      reset({
        label: '',
        line1: '',
        line2: '',
        city: '',
        postalCode: '',
        country: '',
        lat: '',
        lng: '',
        isDefault: false,
      });

      toast.success('Address added.');
      loadAddresses();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to add address';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string) => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null;

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      await api.delete<void>(`/addresses/${id}`, token);
      toast.success('Address deleted.');
      loadAddresses();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete address';
      toast.error(message);
    }
  };

  const handleMakeDefault = async (id: string) => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null;

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      await api.patch<Address>(
        `/addresses/${id}`,
        { isDefault: true },
        token,
      );
      toast.success('Default address updated.');
      loadAddresses();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update address';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Loading addresses...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Address Book
        </h1>
        <form
          className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="md:col-span-1">
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span className="text-red-600">*</span>
              <span>Label</span>
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('label')}
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.label.message}
              </p>
            )}
          </div>

          <div className="md:col-span-1">
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span className="text-red-600">*</span>
              <span>City</span>
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('city')}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Address line 1
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('line1')}
            />
            {errors.line1 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.line1.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Address line 2 (optional)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('line2')}
            />
            {errors.line2 && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.line2.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Postal code (optional)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('postalCode')}
            />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <span className="text-red-600">*</span>
              <span>Country</span>
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('country')}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.country.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Latitude (optional)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('lat')}
            />
            {errors.lat && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.lat.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Longitude (optional)
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              {...register('lng')}
            />
            {errors.lng && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.lng.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="isDefault"
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Set as default address
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add address
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {addresses.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No addresses yet.
            </p>
          )}

          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex flex-col justify-between gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {address.label}
                  </p>
                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {address.city}
                  {address.postalCode ? `, ${address.postalCode}` : ''}
                </p>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {address.country}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleMakeDefault(address.id)}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
