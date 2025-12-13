'use client';

import type { OrderStatus } from '@/types/orders';

type Props = {
  value: OrderStatus;
  disabled?: boolean;
  onChange: (next: OrderStatus) => void;
};

const STATUS_OPTIONS: OrderStatus[] = ['created', 'accepted', 'preparing', 'completed', 'cancelled'];

export function StatusSelect({ value, disabled, onChange }: Props) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
