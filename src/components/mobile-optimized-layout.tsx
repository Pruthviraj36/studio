'use client';

import { ReactNode } from 'react';
import { useIsMobile, useIsTablet, useIsDesktop } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarPosition?: 'left' | 'right';
  showSidebarOnMobile?: boolean;
  className?: string;
}

/**
 * Mobile-optimized layout wrapper
 * Automatically adjusts layout based on screen size
 */
export function MobileOptimizedLayout({
  children,
  sidebar,
  sidebarPosition = 'left',
  showSidebarOnMobile = false,
  className,
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (isMobile && !showSidebarOnMobile) {
    return <div className={cn('w-full', className)}>{children}</div>;
  }

  if (isMobile && showSidebarOnMobile) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="overflow-x-auto">{sidebar}</div>
        <div>{children}</div>
      </div>
    );
  }

  const sidebarWidth = isTablet ? 'w-1/3' : 'w-1/4';

  return (
    <div className={cn('flex gap-4', className)}>
      {sidebarPosition === 'left' && sidebar && (
        <div className={cn(sidebarWidth, 'hidden md:block')}>{sidebar}</div>
      )}
      <div className="flex-1">{children}</div>
      {sidebarPosition === 'right' && sidebar && (
        <div className={cn(sidebarWidth, 'hidden md:block')}>{sidebar}</div>
      )}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: string;
  className?: string;
}

/**
 * Responsive grid component
 */
export function ResponsiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'gap-4',
  className,
}: ResponsiveGridProps) {
  const gridClass =
    mobileColumns === 1 && tabletColumns === 2 && desktopColumns === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : mobileColumns === 1 && tabletColumns === 1 && desktopColumns === 2
        ? 'grid-cols-1 lg:grid-cols-2'
        : mobileColumns === 1 && tabletColumns === 2 && desktopColumns === 4
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          : `grid-cols-${mobileColumns} md:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`;

  return (
    <div className={cn('grid', gridClass, gap, className)}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: string;
  className?: string;
}

/**
 * Responsive container with mobile-friendly padding
 */
export function ResponsiveContainer({
  children,
  maxWidth = 'full',
  padding = 'px-4 md:px-6 lg:px-8',
  className,
}: ResponsiveContainerProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'w-full',
  }[maxWidth];

  return (
    <div className={cn('mx-auto w-full', maxWidthClass, padding, className)}>
      {children}
    </div>
  );
}

interface TouchFriendlyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Touch-friendly button with larger hit area
 */
export function TouchFriendlyButton({
  children,
  className,
  ...props
}: TouchFriendlyButtonProps) {
  return (
    <button
      className={cn(
        'min-h-12 min-w-12 rounded-lg transition-all active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Responsive text component
 */
interface ResponsiveTextProps {
  children: ReactNode;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

export function ResponsiveText({
  children,
  mobileSize = 'text-sm',
  tabletSize = 'md:text-base',
  desktopSize = 'lg:text-lg',
  as = 'p',
  className,
}: ResponsiveTextProps) {
  const Component = as;
  
  return (
    <Component className={cn(mobileSize, tabletSize, desktopSize, className)}>
      {children}
    </Component>
  );
}
