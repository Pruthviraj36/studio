'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@/lib/responsive';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface MobileNavigationProps {
  items: MobileNavItem[];
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * Mobile-optimized navigation with collapsible menu
 */
export function MobileNavigation({
  items,
  onNavigate,
  className,
}: MobileNavigationProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (isOpen && isMobile) {
      const handleClick = () => setIsOpen(false);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isOpen, isMobile]);

  if (!isMobile) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border bg-white shadow-lg">
          <nav className="flex flex-col">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  onNavigate?.(item.href);
                  // Navigation would typically happen here via router
                  window.location.href = item.href;
                }}
                className={cn(
                  'flex items-center gap-3 border-b px-4 py-3 text-sm transition-colors',
                  'hover:bg-gray-50',
                  item.active && 'bg-blue-50 text-blue-600 font-medium',
                  index === items.length - 1 && 'border-b-0'
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile bottom navigation (tab bar style)
 */
interface MobileBottomNavProps {
  items: MobileNavItem[];
  onNavigate?: (href: string) => void;
}

export function MobileBottomNav({ items, onNavigate }: MobileBottomNavProps) {
  const isMobile = useIsMobile();

  if (!isMobile || items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <nav className="flex items-center justify-around">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.(item.href);
              window.location.href = item.href;
            }}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-3 text-xs transition-colors',
              'hover:text-blue-600',
              item.active && 'text-blue-600'
            )}
          >
            {item.icon && <span className="h-6 w-6">{item.icon}</span>}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

/**
 * Mobile drawer component (sidebar)
 */
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  title?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  position = 'left',
  title,
}: MobileDrawerProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 z-50 h-full w-4/5 max-w-sm bg-white shadow-lg transition-transform duration-300 ease-in-out',
          position === 'left'
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : isOpen
              ? 'translate-x-0'
              : 'translate-x-full',
          position === 'left' ? 'left-0' : 'right-0'
        )}
      >
        <div className="flex h-full flex-col">
          {title && (
            <div className="flex items-center justify-between border-b px-4 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
