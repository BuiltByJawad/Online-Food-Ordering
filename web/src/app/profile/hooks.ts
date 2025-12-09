'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getAccessToken, fetchCurrentUser } from '@/lib/auth';
import type { User, Address } from '@/types/api';
import {
  profileSchema,
  addressSchema,
  type ProfileFormValues,
  type AddressFormValues,
} from './schemas';

export function useProfileForm() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      setLoading(false);
      return;
    }

    fetchCurrentUser(token)
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
  }, [form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      const data = await api.patch<User>(
        '/users/me',
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

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
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
    const token = getAccessToken();

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

  const handleSubmit = form.handleSubmit(async (values) => {
    const token = getAccessToken();

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

      form.reset({
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
  });

  const deleteAddress = async (id: string) => {
    const token = getAccessToken();

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

  const makeDefault = async (id: string) => {
    const token = getAccessToken();

    if (!token) {
      toast.error('You are not logged in.');
      return;
    }

    try {
      await api.patch<Address>(`/addresses/${id}`, { isDefault: true }, token);
      toast.success('Default address updated.');
      loadAddresses();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update address';
      toast.error(message);
    }
  };

  return {
    addresses,
    loading,
    form,
    handleSubmit,
    deleteAddress,
    makeDefault,
  };
}
