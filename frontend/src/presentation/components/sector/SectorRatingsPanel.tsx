import { ChartColumnBig } from 'lucide-react';
import { useMemo } from 'react';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { moodBarClass } from '@/presentation/components/mood/moodTone';
import { ThermometerLinkActions } from '@/presentation/components/mood/ThermometerLinkActions';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useMoodSummary } from '@/presentation/hooks/useMoodSummary';
import { useSectors } from '@/presentation/hooks/useSectors';

const VISIBLE_LIMIT = 8;
const MAX_SCORE = 5;

interface SectorRatingsPanelProps {
  companyId: number | undefined;
}

interface SectorRating {
  key: string;
  name: string;
  total: number;
  average: number;
}

function Highlight({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-title">{value}</p>
      {hint !== undefined && (
        <p className="text-xs tabular-nums text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function SectorRatingsPanel({ companyId }: SectorRatingsPanelProps) {
  const sectors = useSectors({ companyId, page: 1 });
  const moods = useMoodSummary({ companyId });

  const ratings = useMemo<SectorRating[]>(() => {
    const bySector = moods.data?.bySector ?? [];

    const rated = bySector
      .filter((entry) => entry.total > 0)
      .map((entry) => ({
        key: entry.sectorId === null ? 'sem-setor' : `setor-${entry.sectorId}`,
        name: entry.sectorName ?? 'Sem setor informado',
        total: entry.total,
        average: entry.average,
      }))
      .sort((a, b) => b.average - a.average || b.total - a.total);

    const answered = new Set(rated.map((entry) => entry.key));

    const pending = (sectors.data?.sectors ?? [])
      .filter((sector) => !answered.has(`setor-${sector.id}`))
      .map((sector) => ({
        key: `setor-${sector.id}`,
        name: sector.name,
        total: 0,
        average: 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    return [...rated, ...pending];
  }, [moods.data, sectors.data]);

  const visible = ratings.slice(0, VISIBLE_LIMIT);
  const answered = ratings.filter((entry) => entry.total > 0);
  const best = answered[0];
  const worst = answered.length > 1 ? answered[answered.length - 1] : undefined;
  const loading = moods.isPending || sectors.isPending;
  const totalSectors = Math.max(sectors.data?.total ?? 0, ratings.length);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ChartColumnBig className="size-4 text-primary" />
          Avaliações por setor
        </CardTitle>
        <CardDescription>
          Média do termômetro e volume de respostas registradas em cada setor.
        </CardDescription>

        <CardAction>
          <Badge variant="secondary" className="hidden h-7 px-2.5 sm:inline-flex">
            {loading ? '—' : `${answered.length} de ${totalSectors} avaliados`}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-6 w-full" />
            ))}
          </div>
        )}

        {!loading && moods.isError && (
          <p className="text-sm text-destructive">{moods.error.message}</p>
        )}

        {!loading && !moods.isError && ratings.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum setor cadastrado para acompanhar.
          </div>
        )}

        {!loading && answered.length === 0 && ratings.length > 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma avaliação registrada ainda. Compartilhe o link com a equipe para começar.
          </div>
        )}

        {best !== undefined && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Highlight
              label="Respostas no período"
              value={String(moods.data?.total ?? 0)}
              hint={`${answered.length} setor${answered.length === 1 ? '' : 'es'} com respostas`}
            />
            <Highlight
              label="Melhor média"
              value={best.name}
              hint={`${best.average.toFixed(2)} · ${moodLabel(moodScoreFromAverage(best.average))}`}
            />
            {worst !== undefined && (
              <Highlight
                label="Menor média"
                value={worst.name}
                hint={`${worst.average.toFixed(2)} · ${moodLabel(moodScoreFromAverage(worst.average))}`}
              />
            )}
          </div>
        )}

        {visible.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {visible.map((entry) => {
              const score = entry.total === 0 ? null : moodScoreFromAverage(entry.average);
              const share = score === null ? 0 : Math.round((entry.average / MAX_SCORE) * 100);

              return (
                <li key={entry.key} className="flex items-center gap-3">
                  <MoodFace score={score} size="sm" />

                  <span className="w-24 shrink-0 truncate text-xs text-title sm:w-36">
                    {entry.name}
                  </span>

                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                    {score !== null && (
                      <div
                        className={`h-full rounded-full transition-[width] ${moodBarClass(score)}`}
                        style={{ width: `${share}%` }}
                      />
                    )}
                  </div>

                  <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {entry.total === 0
                      ? 'sem respostas'
                      : `${entry.average.toFixed(1)} · ${entry.total} resp.`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {ratings.length > visible.length && (
          <p className="text-xs text-muted-foreground">
            Exibindo {visible.length} de {ratings.length} setores.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-muted-foreground">
          Compartilhe o link com a equipe: cada pessoa escolhe o próprio setor e responde de forma
          anônima.
        </span>

        <ThermometerLinkActions companyId={companyId} />
      </CardFooter>
    </Card>
  );
}
