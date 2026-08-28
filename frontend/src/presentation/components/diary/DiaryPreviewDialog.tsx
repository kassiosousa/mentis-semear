import { CalendarDays } from 'lucide-react';
import { DIARY_PHOTO_SLOTS, type DiaryPhotoSlot } from '@/domain/diary/entities/Diary';
import { DiaryPhotoMedia } from '@/presentation/components/diary/DiaryPhotoMedia';
import { formatDiaryDateTime } from '@/presentation/components/diary/diaryFormat';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { useDiaryPhoto } from '@/presentation/hooks/useDiary';

export interface DiaryPreview {
  diaryId: number | null;
  title: string;
  datetime: string;
  description: string;
  photo1: File | null;
  photo2: File | null;
  savedPhoto1Url: string | null;
  savedPhoto2Url: string | null;
}

interface DiaryPreviewDialogProps {
  preview: DiaryPreview | null;
  onOpenChange: (open: boolean) => void;
}

function PreviewPhoto({
  slot,
  preview,
}: {
  slot: DiaryPhotoSlot;
  preview: DiaryPreview;
}) {
  const file = slot === 1 ? preview.photo1 : preview.photo2;
  const savedUrl = slot === 1 ? preview.savedPhoto1Url : preview.savedPhoto2Url;
  const photo = useDiaryPhoto(preview.diaryId, slot, file, savedUrl !== null);

  return (
    <figure className="flex flex-col gap-1.5">
      <DiaryPhotoMedia photo={photo} alt={`Foto ${slot} do encontro`} className="h-52" />
      <figcaption className="text-xs text-muted-foreground">Foto {slot}</figcaption>
    </figure>
  );
}

export function DiaryPreviewDialog({ preview, onOpenChange }: DiaryPreviewDialogProps) {
  return (
    <Dialog open={preview !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévia do diário</DialogTitle>
          <DialogDescription>
            Relato e registro fotográfico reunidos como ficam no diário da oficina.
          </DialogDescription>
        </DialogHeader>

        {preview !== null && (
          <article className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4">
            <header className="flex flex-col gap-1">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 text-primary" />
                {formatDiaryDateTime(preview.datetime)}
              </p>
              <h3 className="font-heading text-lg font-semibold text-title">
                {preview.title === '' ? 'Sem título' : preview.title}
              </h3>
            </header>

            <section className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Relato
              </p>
              <p className="text-sm whitespace-pre-wrap text-body">
                {preview.description === '' ? 'Sem relato registrado.' : preview.description}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Registro fotográfico
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {DIARY_PHOTO_SLOTS.map((slot) => (
                  <PreviewPhoto key={slot} slot={slot} preview={preview} />
                ))}
              </div>
            </section>
          </article>
        )}
      </DialogContent>
    </Dialog>
  );
}
