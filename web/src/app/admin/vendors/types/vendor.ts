import type { User, Vendor } from '@/types/api';

export interface AdminVendor extends Vendor {
  owner: User;
  createdAt?: string;
}
