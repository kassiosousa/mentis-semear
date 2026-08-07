import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NewSeed, Seed } from '@/domain/seed/entities/Seed';
import { container } from '@/presentation/container';

export const seedKeys = {
  all: ['seeds'] as const,
  list: () => [...seedKeys.all, 'list'] as const,
};

export function useSeeds() {
  return useQuery<Seed[]>({
    queryKey: seedKeys.list(),
    queryFn: () => container.seeds.list.execute(),
  });
}

export function useCreateSeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewSeed) => container.seeds.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: seedKeys.all }),
  });
}
