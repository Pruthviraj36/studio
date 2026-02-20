/**
 * Performance Monitoring & Optimization
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  const metric: PerformanceMetric = {
    name,
    duration,
    timestamp: Date.now(),
  };
  
  metrics.push(metric);

  // Log if slow
  if (duration > 1000) {
    console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (slow)`);
  } else if (duration > 500) {
    console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
    };
    
    metrics.push(metric);

    if (duration > 1000) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms (slow)`);
    } else if (duration > 500) {
      console.debug(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

export function getMetrics() {
  return metrics;
}

export function clearMetrics() {
  metrics.length = 0;
}

export function logMetricsSummary() {
  if (metrics.length === 0) {
    console.log('[Performance] No metrics recorded');
    return;
  }

  const slowMetrics = metrics.filter(m => m.duration > 500);
  const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;

  console.group('[Performance Summary]');
  console.log(`Total metrics: ${metrics.length}`);
  console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`Slow operations (>500ms): ${slowMetrics.length}`);
  if (slowMetrics.length > 0) {
    console.table(slowMetrics);
  }
  console.groupEnd();
}

// Web Vitals
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).name === 'first-input') {
            console.debug('[WebVital] FID:', (entry as any).processingDuration);
          }
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.debug('[WebVital] Observer not supported');
    }
  }

  // Navigation Timing
  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.debug('[WebVital] Page Load Time:', pageLoadTime, 'ms');
  });
}
