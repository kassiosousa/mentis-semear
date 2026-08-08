import type { Company, CompanyInput } from '@/domain/company/entities/Company';
import type {
  CompanyFilters,
  CompanyPage,
  CompanyRepository,
} from '@/domain/company/repositories/CompanyRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface CompanyApiModel {
  id: number;
  name: string;
  address: string;
  email: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CompaniesApiPage {
  data?: CompanyApiModel[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

function toEntity(model: CompanyApiModel): Company {
  return {
    id: model.id,
    name: model.name,
    address: model.address,
    email: model.email,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}

export class HttpCompanyRepository implements CompanyRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: CompanyFilters = {}): Promise<CompanyPage> {
    const search = filters.search?.trim();

    const payload = await this.http.get<CompaniesApiPage | CompanyApiModel[]>('/companies', {
      params: {
        search: search === '' ? undefined : search,
        page: filters.page,
      },
    });

    if (Array.isArray(payload)) {
      return {
        companies: payload.map(toEntity),
        currentPage: 1,
        perPage: payload.length,
        total: payload.length,
      };
    }

    const models = payload.data ?? [];

    return {
      companies: models.map(toEntity),
      currentPage: payload.current_page ?? 1,
      perPage: payload.per_page ?? models.length,
      total: payload.total ?? models.length,
    };
  }

  async create(input: CompanyInput): Promise<Company> {
    const payload = await this.http.post<unknown>('/companies', input);

    return toEntity(unwrap<CompanyApiModel>(payload));
  }

  async update(id: number, input: CompanyInput): Promise<Company> {
    const payload = await this.http.put<unknown>(`/companies/${id}`, input);

    return toEntity(unwrap<CompanyApiModel>(payload));
  }

  async remove(id: number): Promise<void> {
    await this.http.delete<unknown>(`/companies/${id}`);
  }
}
