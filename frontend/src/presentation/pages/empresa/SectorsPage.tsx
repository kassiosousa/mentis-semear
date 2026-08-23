import { SectorsListing } from '@/presentation/components/sector/SectorsListing';
import { useCurrentUser } from '@/presentation/hooks/useSession';

export function SectorsPage() {
  const user = useCurrentUser();

  return <SectorsListing scope="empresa" companyId={user?.companyId ?? undefined} />;
}
