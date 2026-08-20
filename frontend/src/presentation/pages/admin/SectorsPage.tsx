import { SectorsListing } from '@/presentation/components/sector/SectorsListing';
import { useDirectory } from '@/presentation/hooks/useDirectory';

export function SectorsPage() {
  const directory = useDirectory({ facilitators: false });

  return (
    <SectorsListing
      scope="admin"
      companyName={directory.companyName}
      companies={directory.companies}
    />
  );
}
