import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  domInteractive: number;
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      const paintMetrics = performance.getEntriesByType('paint');
      const navigationMetrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const firstContentfulPaint = paintMetrics.find(
        (entry) => entry.name === 'first-contentful-paint'
      )?.startTime || 0;

      setMetrics({
        loadTime: navigationMetrics.loadEventEnd - navigationMetrics.startTime,
        firstContentfulPaint,
        domInteractive: navigationMetrics.domInteractive,
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
};