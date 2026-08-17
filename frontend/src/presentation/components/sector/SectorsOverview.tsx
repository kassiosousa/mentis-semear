import { ArrowRight, Layers } from 'lucide-react';
import { moodOfSector } from '@/domain/mood/entities/MoodSummary';
import { SectorCard } from '@/presentation/components/sector/SectorCard';
import { SectorsListLink, type SectorScope } from '@/presentation/components/sector/SectorLink';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useMoodSummary } from '@/presentation/hooks/useMoodSummary';
import { useSectors } from '@/presentation/hooks/useSectors';

const PREVIEW_LIMIT = 5;

interface SectorsOverviewProps {
  scope: SectorScope;
  companyId?: number;
  companyName?: (id: number) => string;
}

export function SectorsOverview({ scope, companyId, companyName }: SectorsOverviewProps) {
  const query = useSectors({ companyId, page: 1 });
  const moods = useMoodSummary({ companyId });

  const sectors = (query.data?.sectors ?? []).slice(0, PREVIEW_LIMIT);
  const total = query.data?.total ?? 0;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-4 text-primary" />
          Setores
        </CardTitle>
        <CardDescription>
          {scope === 'admin'
            ? 'Setores cadastrados em todas as empresas.'
            : 'Setores cadastrados na sua empresa.'}
        </CardDescription>

        <CardAction className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden h-7 px-2.5 sm:inline-flex">
            {query.isPending ? '—' : `${total} no total`}
          </Badge>

          <Button variant="outline" size="sm" asChild>
            <SectorsListLink scope={scope}>
              Ver mais
              <ArrowRight className="size-4" />
            </SectorsListLink>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {query.isPending && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {query.isError && <p className="text-sm text-destructive">{query.error.message}</p>}

        {query.isSuccess && sectors.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum setor cadastrado.
          </div>
        )}

        {sectors.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sectors.map((sector) => (
              <SectorCard
                key={sector.id}
                sector={sector}
                scope={scope}
                companyName={companyName?.(sector.companyId)}
                mood={moodOfSector(moods.data, sector.id)}
              />
            ))}
          </div>
        )}

        {total > sectors.length && (
          <p className="mt-3 text-xs text-muted-foreground">
            Exibindo {sectors.length} de {total} setores.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
