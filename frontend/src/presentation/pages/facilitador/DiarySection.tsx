import { BookOpen, Pencil } from 'lucide-react';
import { useEffect, useState, type ComponentProps } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import type { DiaryInput } from '@/domain/diary/entities/Diary';
import { ValidationError } from '@/domain/shared/errors/AppError';
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

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
  }, [query.isSuccess, diary, workshopDatetime]);

  const setField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const onError = (error: Error) => {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = {};
      for (const [field, messages] of Object.entries(error.fields)) {
        if (messages[0] !== undefined) fields[field] = messages[0];
      }
      setErrors(fields);
    }

    toast.error(error.message, { id: 'diary-form' });
  };

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    const candidate = {
      title: values.title.trim(),
      description: values.description.trim(),
      datetime: values.datetime,
    };

    const parsed = schema.safeParse(candidate);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});

    const payload = { ...candidate, datetime: toIso(candidate.datetime) };

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
          Registro do encontro. Cada oficina tem um único diário.
        </CardDescription>
        {diary !== null && !editing && (
          <CardAction>
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
            <p className="text-xs text-muted-foreground">{formatDateTime(diary.datetime)}</p>
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
              <Button type="submit" size="lg" disabled={pending}>
                {pending ? 'Salvando…' : diary === null ? 'Registrar diário' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
