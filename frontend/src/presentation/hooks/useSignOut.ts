import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { container } from '@/presentation/container';

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => container.auth.signOut.execute(),
    onSettled: async () => {
      queryClient.clear();
      await navigate({ to: '/login', search: {} });
    },
  });
}
