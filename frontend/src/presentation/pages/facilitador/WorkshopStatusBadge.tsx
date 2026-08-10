import { isPast, type Workshop } from '@/domain/workshop/entities/Workshop';
import { Badge } from '@/presentation/components/ui/badge';

export function WorkshopStatusBadge({ workshop }: { workshop: Workshop }) {
  if (isPast(workshop)) {
    return <Badge variant="secondary">Realizada</Badge>;
  }

  return (
    <Badge variant="outline" className="border-blue-500 bg-blue-100 text-blue-700">
      Agendada
    </Badge>
  );
}
