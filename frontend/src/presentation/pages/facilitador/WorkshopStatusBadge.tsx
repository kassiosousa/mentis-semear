import { Badge } from '@/presentation/components/ui/badge';
import { isPastWorkshop, type FacilitatorWorkshop } from '@/presentation/pages/facilitador/mockWorkshops';

export function WorkshopStatusBadge({ workshop }: { workshop: FacilitatorWorkshop }) {
  if (isPastWorkshop(workshop)) {
    return <Badge variant="secondary">Realizada</Badge>;
  }

  return (
    <Badge variant="outline" className="border-blue-500 bg-blue-100 text-blue-700">
      Agendada
    </Badge>
  );
}
