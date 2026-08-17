import { ArrowLeft, Building2, CalendarDays, Layers, Smile } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { MOOD_SCORES, moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { MoodFace, MoodFaceBadge, MoodFaceScale } from '@/presentation/components/mood/MoodFace';
import { moodBarClass } from '@/presentation/components/mood/moodTone';
import { SectorsListLink, type SectorScope } from '@/presentation/components/sector/SectorLink';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useMoodSummary } from '@/presentation/hooks/useMoodSummary';
import { useSector } from '@/presentation/hooks/useSectors';

interface SectorDetailProps {
  sectorId: number;
  scope: SectorScope;
  companyName?: (id: number) => string;
}

function formatDateTime(value: string | null): string {
  if (value === null) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm break-words text-title">{children}</div>
      </div>
    </div>
  );
}

export function SectorDetail({ sectorId, scope, companyName }: SectorDetailProps) {
  const sector = useSector(sectorId);
  const moods = useMoodSummary({ sectorId }, Number.isInteger(sectorId) && sectorId > 0);

  const summary = moods.data;
  const peak =
    summary === undefined
      ? 0
      : Math.max(...MOOD_SCORES.map((score) => summary.distribution[score]), 0);
  const averageScore = moodScoreFromAverage(summary?.average);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <SectorsListLink scope={scope}>
            <ArrowLeft className="size-4" />
            Voltar para setores
          </SectorsListLink>
        </Button>

        <PageHeading
          title={sector.data?.name ?? `Setor #${sectorId}`}
          subtitle={
            sector.data === undefined
              ? undefined
              : scope === 'admin'
                ? (companyName?.(sector.data.companyId) ?? undefined)
                : 'Setor da sua empresa.'
          }
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Dados do setor
          </CardTitle>
          <CardDescription>Informações do cadastro.</CardDescription>
        </CardHeader>

        <CardContent>
          {sector.isPending && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {sector.isError && <p className="text-sm text-destructive">{sector.error.message}</p>}

          {sector.isSuccess && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field icon={Layers} label="Nome">
                {sector.data.name}
              </Field>

              <Field icon={Building2} label="Empresa">
                {companyName?.(sector.data.companyId) ?? `Empresa #${sector.data.companyId}`}
              </Field>

              <Field icon={CalendarDays} label="Criado em">
                {formatDateTime(sector.data.createdAt)}
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Smile className="size-4 text-primary" />
            Termômetro emocional
          </CardTitle>
          <CardDescription>Respostas anônimas registradas para este setor.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {moods.isPending && <Skeleton className="h-24 w-full" />}

          {moods.isError && <p className="text-sm text-destructive">{moods.error.message}</p>}

          {moods.isSuccess && summary !== undefined && summary.total === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-4 py-8">
              <MoodFaceScale size="lg" showLabels className="max-w-xs" />
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma resposta registrada para este setor.
              </p>
            </div>
          )}

          {moods.isSuccess && summary !== undefined && summary.total > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <MoodFaceBadge score={averageScore} label={moodLabel(averageScore)} />

                  <div>
                    <p className="text-xs text-muted-foreground">Humor médio</p>
                    <p className="text-3xl font-semibold tabular-nums text-title sm:text-4xl">
                      {summary.average?.toFixed(2) ?? '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">{moodLabel(averageScore)}</p>
                  </div>
                </div>

                <div className='self-start'>
                  <p className="text-xs text-muted-foreground">Respostas</p>
                  <p className="text-3xl font-semibold tabular-nums text-title sm:text-4xl">
                    {summary.total}
                  </p>
                </div>

                <MoodFaceScale
                  active={averageScore}
                  size="lg"
                  showEnds
                  className="w-full max-w-3xs sm:ml-auto sm:w-auto"
                />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Distribuição</p>

                {MOOD_SCORES.map((score) => {
                  const count = summary.distribution[score];
                  const share = peak === 0 ? 0 : Math.round((count / peak) * 100);
                  const percent = Math.round((count / summary.total) * 100);

                  return (
                    <div key={score} className="flex items-center gap-3">
                      <span className="flex w-24 shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:w-28">
                        <MoodFace score={score} size="sm" />
                        <span className="truncate">{moodLabel(score)}</span>
                      </span>

                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-[width] ${moodBarClass(score)}`}
                          style={{ width: `${share}%` }}
                        />
                      </div>

                      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {count} · {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
