import { useMemo } from 'react';
import { thermometerLinkOf } from '@/domain/company/entities/Company';
import { useCompanies } from '@/presentation/hooks/useCompanies';
import { useUsers } from '@/presentation/hooks/useUsers';

interface DirectoryOptions {
  facilitators?: boolean;
}

export function useDirectory({ facilitators: withFacilitators = true }: DirectoryOptions = {}) {
  const companiesQuery = useCompanies({ page: 1 });
  const facilitatorsQuery = useUsers({ type: 'facilitador', page: 1 }, withFacilitators);

  const companies = useMemo(
    () => companiesQuery.data?.companies ?? [],
    [companiesQuery.data],
  );

  const facilitators = useMemo(
    () => facilitatorsQuery.data?.users ?? [],
    [facilitatorsQuery.data],
  );

  const thermometerById = useMemo(
    () =>
      new Map(
        companies.map((company) => [
          company.id,
          thermometerLinkOf(company, window.location.origin),
        ]),
      ),
    [companies],
  );

  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
  );

  const facilitatorById = useMemo(
    () => new Map(facilitators.map((user) => [user.id, user.name])),
    [facilitators],
  );

  return {
    companies,
    facilitators,
    companyName: (id: number) => companyById.get(id) ?? `Empresa #${id}`,
    thermometerLink: (id: number) => thermometerById.get(id) ?? null,
    facilitatorName: (id: string | null) =>
      id === null ? null : (facilitatorById.get(id) ?? `#${id.slice(0, 8)}`),
  };
}
