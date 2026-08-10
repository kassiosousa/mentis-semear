import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Diary, DiaryInput, DiaryUpdate } from '@/domain/diary/entities/Diary';
import { container } from '@/presentation/container';

export const diaryKeys = {
  all: ['diaries'] as const,
  byWorkshop: (workshopId: number) => [...diaryKeys.all, 'workshop', workshopId] as const,
};

export function useWorkshopDiary(workshopId: number) {
  return useQuery<Diary | null>({
    queryKey: diaryKeys.byWorkshop(workshopId),
    queryFn: () => container.diaries.findByWorkshop.execute(workshopId),
  });
}

export function useCreateDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DiaryInput) => container.diaries.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}

export function useUpdateDiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: DiaryUpdate }) =>
      container.diaries.update.execute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diaryKeys.all }),
  });
}
