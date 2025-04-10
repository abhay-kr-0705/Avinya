import { useState, useEffect } from 'react';
import { usePerformanceMetrics } from './usePerformanceMetrics';
import { logger } from '../utils/errorLogging';

export const useLoadingState = (loadingFunction: () => Promise<void>) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const metrics = usePerformanceMetrics();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadingFunction();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        logger.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [loadingFunction]);

  return { loading, error, metrics };
};