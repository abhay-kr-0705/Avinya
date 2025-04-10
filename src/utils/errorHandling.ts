import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ErrorWithMessage {
  message: string;
  code?: string;
  details?: unknown;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ErrorWithMessage).message;
  }

  return 'An unexpected error occurred.';
}

export const handleError = (error: any, customMessage?: string) => {
  console.error(error);
  const message = customMessage || 'An error occurred';
  toast.error(message);
};

export const handleErrorAlternative = (error: unknown, defaultMessage: string = 'An error occurred') => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    toast.error(message);
    return;
  }
  
  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }
  
  toast.error(defaultMessage);
};