// Maximum number of retries for network requests
const MAX_RETRIES = 3;
// Base delay in milliseconds between retries (will be multiplied by attempt number)
const BASE_DELAY = 1000;

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('Failed to fetch')) {
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY * (MAX_RETRIES - retries + 1)));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed') ||
    error.message.includes('Network Error')
  );
}