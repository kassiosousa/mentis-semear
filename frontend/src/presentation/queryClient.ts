import { QueryClient } from '@tanstack/react-query';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/shared/errors/AppError';

const NON_RETRYABLE = [UnauthorizedError, ForbiddenError, NotFoundError, ValidationError];

function isRetryable(error: unknown): boolean {
  return !NON_RETRYABLE.some((type) => error instanceof type);
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => isRetryable(error) && failureCount < 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
