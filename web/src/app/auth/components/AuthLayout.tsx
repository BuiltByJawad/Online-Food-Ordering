'use client';

import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-zinc-900">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>

        {children}

        {footer ? <div className="mt-4 text-center">{footer}</div> : null}
      </div>
    </div>
  );
}
