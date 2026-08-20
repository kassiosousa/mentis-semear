import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Company, CompanyInput } from '@/domain/company/entities/Company';
import type { CompanyFilters, CompanyPage } from '@/domain/company/repositories/CompanyRepository';
import { container } from '@/presentation/container';

export const companyKeys = {
  all: ['companies'] as const,
  list: (filters: CompanyFilters) => [...companyKeys.all, 'list', filters] as const,
  detail: (id: number) => [...companyKeys.all, 'detail', id] as const,
};

export function useCompanies(filters: CompanyFilters, enabled = true) {
  return useQuery<CompanyPage>({
    queryKey: companyKeys.list(filters),
    queryFn: () => container.companies.list.execute(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCompany(id: number | undefined) {
  return useQuery<Company>({
    queryKey: companyKeys.detail(id ?? 0),
    queryFn: () => container.companies.find.execute(id as number),
    enabled: id !== undefined,
    staleTime: 5 * 60_000,
    meta: { silentError: true },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanyInput) => container.companies.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CompanyInput }) =>
      container.companies.update.execute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => container.companies.remove.execute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: companyKeys.all }),
  });
}
