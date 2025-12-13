import { api } from '@/lib/api';
import type { BranchAnalytics } from '@/types/orders';
import type { BranchPublicInfo } from '../../orders/services/orders';

export function fetchBranchAnalytics(branchId: string, days: number, token: string) {
  return api.get<BranchAnalytics>(`/orders/branch/${branchId}/analytics?days=${days}`, token);
}

// Re-exported for convenience
export { fetchBranchInfo } from '../../orders/services/orders';
export type { BranchPublicInfo };
