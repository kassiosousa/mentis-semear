import { Building2, CalendarDays, CheckCircle2, LinkIcon, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PublicWorkshop } from '@/domain/workshop/entities/Workshop';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';

function formatDateTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-primary">
      <header className="relative isolate overflow-hidden bg-linear-to-br from-primary-700 via-primary-500 to-secondary-700 px-6 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 -z-10 size-64 rounded-full bg-white/15 blur-3xl"
        />
        <img
          src="/assets/logo-branca.png"
          alt="Mentis Semear"
          className="mx-auto h-16 w-auto select-none"
        />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5">{children}</div>
      </main>

      <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">
        Mentis Semear · Programa de saúde mental no trabalho
      </footer>
    </div>
  );
}

export function WorkshopSummary({
  workshop,
  pending,
}: {
  workshop: PublicWorkshop | undefined;
  pending: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        {pending && (
          <>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </>
        )}

        {workshop !== undefined && (
          <>
            <div className="flex items-center gap-2.5">
              <Building2 className="size-4 shrink-0 text-primary" />
              <p className="font-semibold text-title">{workshop.company}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm first-letter:uppercase">{formatDateTime(workshop.datetime)}</p>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm break-words">{workshop.address}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function SuccessPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-7 text-primary" />
        </span>

        <h2 className="font-heading text-xl font-semibold text-title">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function InvalidLinkNotice({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-destructive/10">
          <LinkIcon className="size-7 text-destructive" />
        </span>

        <h2 className="font-heading text-xl font-semibold text-title">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>

        {onRetry !== undefined && (
          <Button type="button" variant="outline" size="lg" onClick={onRetry} className="mt-2">
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
