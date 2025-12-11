'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers, type UserRole } from '../hooks';

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  vendor_manager: 'Vendor manager',
  rider: 'Rider',
  admin: 'Admin',
  support: 'Support',
  finance: 'Finance',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { loading, users, error, updatingIds, updateUserRole, reload } =
    useAdminUsers();

  const hasUsers = users.length > 0;

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => a.email.localeCompare(b.email, undefined, { 
        sensitivity: 'base',
      })),
    [users],
  );

  const handleRoleChange = (userId: string, currentRole: UserRole, nextRole: UserRole) => {
    if (currentRole === nextRole) return;

    const currentLabel = ROLE_LABELS[currentRole];
    const nextLabel = ROLE_LABELS[nextRole];

    const confirmed = window.confirm(
      `Change role from "${currentLabel}" to "${nextLabel}" for this user?`,
    );

    if (!confirmed) return;

    void updateUserRole(userId, nextRole);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="w-full max-w-4xl space-y-4 rounded-xl bg-white p-6 shadow-md dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Admin – Users
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              View and manage user roles. Use this to promote vendor managers and other staff roles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Back home
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => reload()}
              className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium hover:bg-red-100 dark:border-red-500 dark:hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {!error && !hasUsers && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            No users found.
          </div>
        )}

        {!error && hasUsers && (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-900">
                {sortedUsers.map((user) => {
                  const isUpdating = updatingIds.has(user.id);

                  return (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                        {user.name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                        <select
                          value={user.role as UserRole}
                          disabled={isUpdating}
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              user.role as UserRole,
                              event.target.value as UserRole,
                            )
                          }
                          className="w-40 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        >
                          {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-xs text-zinc-700 dark:text-zinc-200">
                        {user.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
