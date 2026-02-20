'use client';

import { ReactNode } from 'react';
import { useIsMobile } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface MobileFormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

/**
 * Mobile-optimized form with better spacing and touch targets
 */
export function MobileForm({
  children,
  onSubmit,
  className,
}: MobileFormProps) {
  const isMobile = useIsMobile();

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'space-y-5',
        isMobile && 'px-4 py-4',
        !isMobile && 'max-w-2xl',
        className
      )}
    >
      {children}
    </form>
  );
}

interface MobileFormGroupProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Mobile form field group with label and error handling
 */
export function MobileFormGroup({
  label,
  error,
  hint,
  required,
  children,
  className,
}: MobileFormGroupProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
    </div>
  );
}

interface MobileTouchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * Touch-friendly input field
 */
export function MobileTouchInput({
  label,
  error,
  hint,
  icon,
  className,
  ...props
}: MobileTouchInputProps) {
  return (
    <MobileFormGroup label={label} error={error} hint={hint}>
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
        <input
          className={cn(
            'h-12 w-full rounded-lg border border-gray-300 px-4 text-base',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            'placeholder-gray-400 transition-colors',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
    </MobileFormGroup>
  );
}

interface MobileTouchTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  characterCount?: number;
  maxLength?: number;
}

/**
 * Touch-friendly textarea with character count
 */
export function MobileTouchTextarea({
  label,
  error,
  hint,
  characterCount = 0,
  maxLength,
  className,
  ...props
}: MobileTouchTextareaProps) {
  return (
    <MobileFormGroup label={label} error={error} hint={hint}>
      <div className="space-y-2">
        <textarea
          maxLength={maxLength}
          className={cn(
            'min-h-32 w-full rounded-lg border border-gray-300 px-4 py-3 text-base',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            'placeholder-gray-400 transition-colors resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {maxLength && (
          <p className="text-xs text-gray-500">
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </MobileFormGroup>
  );
}

interface MobileSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ label: string; value: string }>;
}

/**
 * Touch-friendly select dropdown
 */
export function MobileSelect({
  label,
  error,
  hint,
  options,
  className,
  ...props
}: MobileSelectProps) {
  return (
    <MobileFormGroup label={label} error={error} hint={hint}>
      <select
        className={cn(
          'h-12 w-full rounded-lg border border-gray-300 px-4 text-base',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
          'placeholder-gray-400 transition-colors cursor-pointer',
          'bg-white appearance-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </MobileFormGroup>
  );
}

interface MobileCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

/**
 * Touch-friendly checkbox with larger hit area
 */
export function MobileCheckbox({
  label,
  description,
  className,
  ...props
}: MobileCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-gray-50">
      <input
        type="checkbox"
        className={cn(
          'mt-1 h-5 w-5 cursor-pointer rounded border-gray-300',
          'text-blue-600 focus:ring-2 focus:ring-blue-200',
          className
        )}
        {...props}
      />
      <div>
        {label && <div className="font-medium text-gray-900">{label}</div>}
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
    </label>
  );
}

interface MobileRadioGroupProps {
  name: string;
  label?: string;
  options: Array<{ label: string; value: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * Touch-friendly radio group
 */
export function MobileRadioGroup({
  name,
  label,
  options,
  value,
  onChange,
}: MobileRadioGroupProps) {
  return (
    <div>
      {label && <div className="mb-3 font-medium text-gray-900">{label}</div>}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg p-3 hover:bg-gray-50"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="mt-1 h-5 w-5 cursor-pointer border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
            />
            <div>
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-500">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

interface MobileButtonGroupProps {
  children: ReactNode;
  stacked?: boolean;
  className?: string;
}

/**
 * Mobile-optimized button group with proper spacing
 */
export function MobileButtonGroup({
  children,
  stacked = true,
  className,
}: MobileButtonGroupProps) {
  return (
    <div
      className={cn(
        stacked ? 'space-y-2' : 'flex gap-2',
        stacked && 'mt-6',
        className
      )}
    >
      {children}
    </div>
  );
}
