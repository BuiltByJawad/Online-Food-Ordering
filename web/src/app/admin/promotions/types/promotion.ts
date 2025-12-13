export type Promotion = {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number | null;
  maxUses: number;
  usageCount: number;
  perUserLimit: number;
  validFrom?: string | null;
  validTo?: string | null;
  branchId?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
};
