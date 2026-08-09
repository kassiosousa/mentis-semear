import { useMemo } from 'react';
import { useCompanies } from '@/presentation/hooks/useCompanies';
import { useUsers } from '@/presentation/hooks/useUsers';

export function useDirectory() {
  const companiesQuery = useCompanies({ page: 1 });
  const facilitatorsQuery = useUsers({ type: 'facilitador', page: 1 });

  const companies = useMemo(
    () => companiesQuery.data?.companies ?? [],
    [companiesQuery.data],
  );

  const facilitators = useMemo(
    () => facilitatorsQuery.data?.users ?? [],
    [facilitatorsQuery.data],
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
    facilitatorName: (id: string | null) =>
      id === null ? null : (facilitatorById.get(id) ?? `#${id.slice(0, 8)}`),
  };
}
