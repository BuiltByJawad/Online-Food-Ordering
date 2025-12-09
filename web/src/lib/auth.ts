import { api } from './api';
import type { User } from '@/types/api';

export const getAccessToken = () =>
  typeof window !== 'undefined'
    ? window.localStorage.getItem('accessToken')
    : null;

export const fetchCurrentUser = (token: string) => api.get<User>('/users/me', token);
