import { ArrowRight, Building2, Layers, Pencil, Trash2 } from 'lucide-react';
import type { SectorMood } from '@/domain/mood/entities/MoodSummary';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import type { Sector } from '@/domain/sector/entities/Sector';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { SectorDetailLink, type SectorScope } from '@/presentation/components/sector/SectorLink';
import { Button } from '@/presentation/components/ui/button';
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
  onEdit?: (sector: Sector) => void;
  onDelete?: (sector: Sector) => void;
}

export function SectorCard({
  sector,
  scope,
  companyName,
  mood,
  onEdit,
  onDelete,
}: SectorCardProps) {
  const empty = mood == null || mood.total === 0;
  const score = empty ? null : moodScoreFromAverage(mood.average);
  const actionable = onEdit !== undefined || onDelete !== undefined;

  return (
    <Card
      size="sm"
      className="relative h-full transition-colors hover:bg-primary-500/5 hover:ring-primary-500/30"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-4 shrink-0 text-primary" />

          <SectorDetailLink
            scope={scope}
            sectorId={sector.id}
            className="truncate rounded-sm outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {sector.name}
          </SectorDetailLink>

          {actionable ? (
            <div className="relative z-10 -my-1 ml-auto flex shrink-0 items-center gap-0.5">
              {onEdit !== undefined && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(sector)}
                  title="Editar"
                  aria-label={`Editar ${sector.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
              )}

              {onDelete !== undefined && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(sector)}
                  title="Excluir"
                  aria-label={`Excluir ${sector.name}`}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ) : (
            <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
          )}
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
  );
}
