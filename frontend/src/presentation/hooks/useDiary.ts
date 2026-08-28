import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Diary,
  DiaryInput,
  DiaryPhotoSlot,
  DiaryUpdate,
} from '@/domain/diary/entities/Diary';
import { container } from '@/presentation/container';
import { useObjectUrl } from '@/presentation/hooks/useObjectUrl';

export const diaryKeys = {
  all: ['diaries'] as const,
  byWorkshop: (workshopId: number) => [...diaryKeys.all, 'workshop', workshopId] as const,
  photo: (diaryId: number, slot: DiaryPhotoSlot) =>
    [...diaryKeys.all, 'photo', diaryId, slot] as const,
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

export function useDiaryPhotoBlob(diaryId: number | null, slot: DiaryPhotoSlot, enabled: boolean) {
  return useQuery<Blob>({
    queryKey: diaryKeys.photo(diaryId ?? 0, slot),
    queryFn: () => container.diaries.photo.execute(diaryId as number, slot),
    enabled: enabled && diaryId !== null,
    staleTime: 5 * 60_000,
    meta: { silentError: true },
  });
}

export interface DiaryPhotoView {
  url: string | null;
  type: string | null;
  name: string | null;
  loading: boolean;
}

export function useDiaryPhoto(
  diaryId: number | null,
  slot: DiaryPhotoSlot,
  file: File | null,
  hasSaved: boolean,
): DiaryPhotoView {
  const wantsSaved = file === null && hasSaved;
  const saved = useDiaryPhotoBlob(diaryId, slot, wantsSaved);
  const source = file ?? saved.data ?? null;
  const url = useObjectUrl(source);

  return {
    url,
    type: source?.type ?? null,
    name: file?.name ?? null,
    loading: wantsSaved && diaryId !== null && saved.isPending,
  };
}
