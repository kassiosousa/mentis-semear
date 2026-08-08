import { useState, type ComponentProps } from 'react';
import { ValidationError } from '@/domain/shared/errors/AppError';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Textarea } from '@/presentation/components/ui/textarea';
import { useCreateSeed, useSeeds } from '@/presentation/hooks/useSeeds';

export function SeedsPage() {
  const seeds = useSeeds();
  const createSeed = useCreateSeed();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fieldErrors = createSeed.error instanceof ValidationError ? createSeed.error.fields : {};

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    createSeed.mutate(
      { title, content },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Sementes</h1>
        <p className="text-sm text-muted-foreground">Plante uma ideia na mente.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Nova semente</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={fieldErrors.title !== undefined}
              />
              {fieldErrors.title?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                aria-invalid={fieldErrors.content !== undefined}
              />
              {fieldErrors.content?.map((message) => (
                <p key={message} className="text-xs text-destructive">
                  {message}
                </p>
              ))}
            </div>

            <Button type="submit" disabled={createSeed.isPending} className="self-start">
              {createSeed.isPending ? 'Plantando…' : 'Plantar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {seeds.isPending && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full max-w-xl" />
          <Skeleton className="h-20 w-full max-w-xl" />
        </div>
      )}

      {seeds.isError && <p className="text-sm text-destructive">{seeds.error.message}</p>}

      <ul className="flex flex-col gap-3">
        {seeds.data?.map((seed) => (
          <li key={seed.id} className="max-w-xl rounded-lg border border-border p-4">
            <strong className="block">{seed.title}</strong>
            <p className="text-sm text-muted-foreground">{seed.content}</p>
            <small className="text-xs text-muted-foreground">
              {new Date(seed.plantedAt).toLocaleString('pt-BR')}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
