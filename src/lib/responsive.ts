/**
 * Mobile & Responsiveness Utilities
 * Provides hooks and utilities for responsive design
 */

'use client';

import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Hook to check if screen size is at or above a breakpoint
 */
export function useMediaQuery(breakpoint: Breakpoint = 'md'): boolean {
  const [isAbove, setIsAbove] = useState(false);

  useEffect(() => {
    // Set initial value
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    setIsAbove(mediaQuery.matches);

    // Handle changes
    const handler = (e: MediaQueryListEvent) => setIsAbove(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isAbove;
}

/**
 * Hook to detect if device is mobile
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('md');
}

/**
 * Hook to detect if device is tablet
 */
export function useIsTablet(): boolean {
  const isAboveMd = useMediaQuery('md');
  const isAboveLg = useMediaQuery('lg');
  return isAboveMd && !isAboveLg;
}

/**
 * Hook to detect if device is desktop
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('lg');
}

/**
 * Hook to get current screen width
 */
export function useScreenWidth(): number {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

/**
 * Hook to get current viewport orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
      );
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    return () => window.removeEventListener('orientationchange', updateOrientation);
  }, []);

  return orientation;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      () =>
        Boolean(
          typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0)
        )
    );
  }, []);

  return isTouch;
}

/**
 * Get spacing value based on breakpoint
 */
export function getResponsiveSpacing(
  mobile: string,
  tablet: string,
  desktop: string
): string {
  return `${mobile} md:${tablet} lg:${desktop}`;
}

/**
 * Get font size based on breakpoint
 */
export function getResponsiveFontSize(
  mobile: string,
  tablet: string = mobile,
  desktop: string = tablet
): string {
  return `text-${mobile} md:text-${tablet} lg:text-${desktop}`;
}

/**
 * Get grid columns based on breakpoint
 */
export function getResponsiveColumns(mobile: number, tablet: number, desktop: number): string {
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
}
