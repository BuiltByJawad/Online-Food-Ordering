'use client';

import Link from 'next/link';
import { AuthLayout } from '../components/AuthLayout';
import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join to start ordering, managing deliveries, and redeeming promos."
      footer={
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
