'use client';

import Link from 'next/link';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Access your account to manage orders and promotions."
      footer={
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
