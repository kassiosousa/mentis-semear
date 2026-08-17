import { SectorDetail } from '@/presentation/components/sector/SectorDetail';
import { empresaSectorDetailRoute } from '@/presentation/routes/modules/empresa.routes';

export function SectorDetailPage() {
  const { id } = empresaSectorDetailRoute.useParams();

  return <SectorDetail sectorId={Number(id)} scope="empresa" />;
}
