import type { Company, CompanyInput } from '@/domain/company/entities/Company';

export interface CompanyFilters {
  search?: string;
  page?: number;
}

export interface CompanyPage {
  companies: Company[];
  currentPage: number;
  perPage: number;
  total: number;
}

export interface CompanyRepository {
  list(filters?: CompanyFilters): Promise<CompanyPage>;
  find(id: number): Promise<Company>;
  create(input: CompanyInput): Promise<Company>;
  update(id: number, input: CompanyInput): Promise<Company>;
  remove(id: number): Promise<void>;
}
