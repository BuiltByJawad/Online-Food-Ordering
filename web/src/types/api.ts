export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  status: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Address {
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

export interface Vendor {
  id: string;
  name: string;
  brandName?: string;
  legalName?: string;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  commissionRate?: number;
  payoutCycle?: string;
}

export interface Branch {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  country: string;
  lat?: number;
  lng?: number;
  status: string;
  openingHours?: Record<string, unknown>;
  deliveryZones?: Record<string, unknown>;
}

export interface MenuOption {
  id: string;
  type: string;
  name: string;
  priceDelta: number | string;
  isRequired: boolean;
  maxSelection?: number | null;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  basePrice: number | string;
  taxCategory?: string | null;
  isAvailable: boolean;
  availabilitySchedule?: Record<string, unknown> | null;
  options: MenuOption[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}
