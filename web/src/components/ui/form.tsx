'use client';

import { forwardRef } from 'react';
import type { FieldError, FieldErrorsImpl, FieldValues, Merge } from 'react-hook-form';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type BaseProps = {
  label?: string;
  required?: boolean;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<FieldValues>> | string;
  hint?: string;
  className?: string;
};

export const FormField = forwardRef<
  HTMLDivElement,
  BaseProps & { children: React.ReactNode }
>(function FormField({ label, required, error, hint, className, children }, ref) {
  const errorText =
    typeof error === 'string'
      ? error
      : (error as FieldError | undefined)?.message;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-200">
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}
      {children}
      {errorText && (
        <p className="text-[11px] text-red-500" role="alert">
          {errorText}
        </p>
      )}
      {!errorText && hint && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
});

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & BaseProps;

export const FormInput = forwardRef<HTMLInputElement, InputProps>(function FormInput(
  { label, required, error, hint, className, ...props },
  ref,
) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <input
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
          className,
        )}
      />
    </FormField>
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps;

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FormTextarea({ label, required, error, hint, className, ...props }, ref) {
    return (
      <FormField label={label} required={required} error={error} hint={hint}>
        <textarea
          ref={ref}
          {...props}
          className={cn(
            'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
            className,
          )}
        />
      </FormField>
    );
  },
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & BaseProps;

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(function FormSelect(
  { label, required, error, hint, className, children, ...props },
  ref,
) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <select
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50',
          className,
        )}
      >
        {children}
      </select>
    </FormField>
  );
});
