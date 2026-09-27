import { BookOpen, Eye, Pencil } from 'lucide-react';
import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Diary, DiaryInput, DiaryPhotos, DiaryPhotoSlot } from '@/domain/diary/entities/Diary';
import { photoRejection } from '@/domain/diary/entities/Diary';
import { ValidationError } from '@/domain/shared/errors/AppError';
import { DiaryPhotoField } from '@/presentation/components/diary/DiaryPhotoField';
import { formatDiaryDateTime } from '@/presentation/components/diary/diaryFormat';
import {
  DiaryPreviewDialog,
  type DiaryPreview,
} from '@/presentation/components/diary/DiaryPreviewDialog';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { DateTimePicker } from '@/presentation/components/ui/date-time-picker';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Textarea } from '@/presentation/components/ui/textarea';
import { useCreateDiary, useUpdateDiary, useWorkshopDiary } from '@/presentation/hooks/useDiary';

const schema = z.object({
  title: z.string().min(1, 'Informe o título.'),
  description: z.string().min(1, 'Descreva como foi o encontro.'),
  datetime: z.string().min(1, 'Informe a data e a hora.'),
});

const FIELD_BY_API: Record<string, string> = { file_1: 'photo1', file_2: 'photo2' };

const EMPTY_PHOTOS: DiaryPhotos = { photo1: null, photo2: null };

interface FormValues {
  title: string;
  description: string;
  datetime: string;
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIso(local: string): string {
  const date = new Date(local);

  return Number.isNaN(date.getTime()) ? local : date.toISOString();
}

export function DiarySection({
  workshopId,
  workshopDatetime,
}: {
  workshopId: number;
  workshopDatetime: string;
}) {
  const query = useWorkshopDiary(workshopId);
  const createDiary = useCreateDiary();
  const updateDiary = useUpdateDiary();

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<FormValues>({ title: '', description: '', datetime: '' });
  const [photos, setPhotos] = useState<DiaryPhotos>(EMPTY_PHOTOS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<DiaryPreview | null>(null);

  const diary = query.data ?? null;
  const pending = createDiary.isPending || updateDiary.isPending;
  const showForm = editing || (query.isSuccess && diary === null);

  useEffect(() => {
    if (!query.isSuccess) return;

    setValues({
      title: diary?.title ?? '',
      description: diary?.description ?? '',
      datetime: toLocalInput(diary?.datetime ?? workshopDatetime),
    });
    setPhotos(EMPTY_PHOTOS);
    setErrors({});
  }, [query.isSuccess, diary, workshopDatetime]);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const savedPhotoUrl = (slot: DiaryPhotoSlot): string | null =>
    (slot === 1 ? diary?.photo1Url : diary?.photo2Url) ?? null;

  const selectPhoto = (slot: DiaryPhotoSlot, file: File | null) => {
    const field = slot === 1 ? 'photo1' : 'photo2';
    const rejection = file === null ? null : photoRejection(file);

    setErrors((current) => ({ ...current, [field]: rejection ?? '' }));

    if (rejection !== null) return;

    setPhotos((current) => ({ ...current, [field]: file }));
  };

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[FIELD_BY_API[field] ?? field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'diary-form' });
  };

  const openFormPreview = () => {
    setPreview({
      diaryId: diary?.id ?? null,
      title: values.title.trim(),
      datetime: toIso(values.datetime),
      description: values.description.trim(),
      photo1: photos.photo1,
      photo2: photos.photo2,
      savedPhoto1Url: savedPhotoUrl(1),
      savedPhoto2Url: savedPhotoUrl(2),
    });
  };

  const openSavedPreview = (saved: Diary) => {
    setPreview({
      diaryId: saved.id,
      title: saved.title,
      datetime: saved.datetime,
      description: saved.description,
      photo1: null,
      photo2: null,
      savedPhoto1Url: saved.photo1Url,
      savedPhoto2Url: saved.photo2Url,
    });
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const candidate = {
      title: values.title.trim(),
      description: values.description.trim(),
      datetime: values.datetime,
    };

    const next: Record<string, string> = {};
    const parsed = schema.safeParse(candidate);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        next[field] ??= issue.message;
      }
    }

    if (photos.photo1 === null && savedPhotoUrl(1) === null) {
      next.photo1 = 'Envie a primeira foto do encontro.';
    }

    if (photos.photo2 === null && savedPhotoUrl(2) === null) {
      next.photo2 = 'Envie a segunda foto do encontro.';
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});

    const payload = { ...candidate, datetime: toIso(candidate.datetime), ...photos };

    if (diary === null) {
      const input: DiaryInput = { workshopId, ...payload };

      createDiary.mutate(input, {
        onSuccess: () => {
          toast.success('Diário registrado.', { id: 'diary-form' });
          setEditing(false);
        },
        onError,
      });
      return;
    }

    updateDiary.mutate(
      { id: diary.id, input: payload },
      {
        onSuccess: () => {
          toast.success('Diário atualizado.', { id: 'diary-form' });
          setEditing(false);
        },
        onError,
      },
    );
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          Diário da oficina
        </CardTitle>
        <CardDescription>
          Relato e registro fotográfico do encontro. Cada oficina tem um único diário.
        </CardDescription>
        {diary !== null && !editing && (
          <CardAction className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openSavedPreview(diary)}>
              <Eye className="size-3.5" />
              Visualizar diário
            </Button>

            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        {query.isPending && <Skeleton className="h-32 w-full" />}

        {query.isError && <p className="text-sm text-destructive">{query.error.message}</p>}

        {query.isSuccess && !showForm && diary !== null && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{formatDiaryDateTime(diary.datetime)}</p>
            <h3 className="font-medium text-title">{diary.title}</h3>
            <p className="text-sm whitespace-pre-wrap text-body">{diary.description}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-title">Título</Label>
              <Input
                id="diary-title"
                value={values.title}
                onChange={(event) => setField('title', event.target.value)}
                aria-invalid={errors.title !== undefined}
                placeholder="Relato do dia"
                className="h-10"
              />
              {errors.title !== undefined && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-datetime">Data e hora</Label>
              <DateTimePicker
                id="diary-datetime"
                value={values.datetime}
                onChange={(next) => setField('datetime', next)}
                invalid={errors.datetime !== undefined}
              />
              {errors.datetime !== undefined && (
                <p className="text-xs text-destructive">{errors.datetime}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="diary-description">Como foi o encontro</Label>
              <Textarea
                id="diary-description"
                rows={6}
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                aria-invalid={errors.description !== undefined}
                placeholder="Dinâmicas aplicadas, participação do grupo, observações…"
              />
              {errors.description !== undefined && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <Label>Fotos do encontro</Label>
                <span className="text-xs text-muted-foreground">
                  2 arquivos obrigatórios · JPEG, PNG ou PDF · até 5 MB cada
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DiaryPhotoField
                  slot={1}
                  diaryId={diary?.id ?? null}
                  file={photos.photo1}
                  savedUrl={savedPhotoUrl(1)}
                  error={errors.photo1 === '' ? undefined : errors.photo1}
                  disabled={pending}
                  onSelect={(file) => selectPhoto(1, file)}
                />

                <DiaryPhotoField
                  slot={2}
                  diaryId={diary?.id ?? null}
                  file={photos.photo2}
                  savedUrl={savedPhotoUrl(2)}
                  error={errors.photo2 === '' ? undefined : errors.photo2}
                  disabled={pending}
                  onSelect={(file) => selectPhoto(2, file)}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {diary !== null && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setEditing(false)}
                  disabled={pending}
                >
                  Cancelar
                </Button>
              )}

              <Button type="button" variant="outline" size="lg" onClick={openFormPreview}>
                <Eye className="size-4" />
                Visualizar diário
              </Button>

              <Button type="submit" size="lg" disabled={pending}>
                {pending ? 'Salvando…' : diary === null ? 'Registrar diário' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <DiaryPreviewDialog
        preview={preview}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
      />
    </Card>
  );
}
