import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserPage,
} from '@/domain/user/repositories/UserRepository';
import { container } from '@/presentation/container';

export const userKeys = {
  all: ['users'] as const,
  list: (filters: UserFilters) => [...userKeys.all, 'list', filters] as const,
};

export function useUsers(filters: UserFilters) {
  return useQuery<UserPage>({
    queryKey: userKeys.list(filters),
    queryFn: () => container.users.list.execute(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => container.users.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      container.users.update.execute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => container.users.remove.execute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
