import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof UnauthorizedError) return;
        if (query.meta?.silentError === true) return;

        toast.error(error.message, {
          id: `query:${JSON.stringify(query.queryKey)}`,
        });
      },
    }),
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
