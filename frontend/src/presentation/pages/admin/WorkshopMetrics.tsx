import { Star, Users } from 'lucide-react';
import { averageScore } from '@/domain/workshop/entities/Workshop';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { useWorkshopAssessments, useWorkshopCheckIns } from '@/presentation/hooks/useWorkshops';

export function CheckInCount({ workshopId }: { workshopId: number }) {
  const query = useWorkshopCheckIns(workshopId);

  if (query.isPending) return <Skeleton className="h-4 w-8" />;
  if (query.isError) return <span className="text-muted-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <Users className="size-3.5 text-muted-foreground" />
      {query.data.length}
    </span>
  );
}

export function AssessmentSummary({ workshopId }: { workshopId: number }) {
  const query = useWorkshopAssessments(workshopId);

  if (query.isPending) return <Skeleton className="h-4 w-12" />;
  if (query.isError) return <span className="text-muted-foreground">—</span>;

  const average = averageScore(query.data);

  if (average === null) return <span className="text-muted-foreground">Sem respostas</span>;

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <Star className="size-3.5 text-primary" />
      {average.toFixed(1)}
      <span className="text-xs text-muted-foreground">({query.data.length})</span>
    </span>
  );
}
