import type { QueryClient } from '@tanstack/react-query';
import type { Container } from '@/presentation/container';

export interface RouterContext {
  container: Container;
  queryClient: QueryClient;
}