import { ArrowRight, Building2, Layers } from 'lucide-react';
import type { SectorMood } from '@/domain/mood/entities/MoodSummary';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import type { Sector } from '@/domain/sector/entities/Sector';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { SectorDetailLink, type SectorScope } from '@/presentation/components/sector/SectorLink';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';

interface SectorCardProps {
  sector: Sector;
  scope: SectorScope;
  companyName?: string;
  mood?: SectorMood | null;
}

export function SectorCard({ sector, scope, companyName, mood }: SectorCardProps) {
  const empty = mood == null || mood.total === 0;
  const score = empty ? null : moodScoreFromAverage(mood.average);

  return (
    <SectorDetailLink
      scope={scope}
      sectorId={sector.id}
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className="h-full transition-colors hover:bg-primary-500/5 hover:ring-primary-500/30"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-4 shrink-0 text-primary" />
            <span className="truncate">{sector.name}</span>
            <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </CardTitle>

          {companyName !== undefined && (
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{companyName}</span>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MoodFace score={score} size="sm" />
            {empty ? (
              <span className="truncate">Sem respostas no termômetro</span>
            ) : (
              <span className="truncate">
                <strong className="font-semibold text-title">{moodLabel(score)}</strong>{' '}
                <span className="tabular-nums">({mood.average.toFixed(1)})</span> · {mood.total}{' '}
                resposta{mood.total === 1 ? '' : 's'}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </SectorDetailLink>
  );
}
