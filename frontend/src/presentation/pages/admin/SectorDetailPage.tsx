import { SectorDetail } from '@/presentation/components/sector/SectorDetail';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { adminSectorDetailRoute } from '@/presentation/routes/modules/admin.routes';

export function SectorDetailPage() {
  const { id } = adminSectorDetailRoute.useParams();
  const directory = useDirectory({ facilitators: false });

  return (
    <SectorDetail
      sectorId={Number(id)}
      scope="admin"
      companyName={directory.companyName}
      companies={directory.companies}
    />
  );
}
