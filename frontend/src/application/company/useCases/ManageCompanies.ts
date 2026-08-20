import type { Company, CompanyInput } from '@/domain/company/entities/Company';
import type {
  CompanyFilters,
  CompanyPage,
  CompanyRepository,
} from '@/domain/company/repositories/CompanyRepository';

export class ListCompanies {
  constructor(private readonly companies: CompanyRepository) {}

  execute(filters: CompanyFilters = {}): Promise<CompanyPage> {
    return this.companies.list(filters);
  }
}

export class FindCompany {
  constructor(private readonly companies: CompanyRepository) {}

  execute(id: number): Promise<Company> {
    return this.companies.find(id);
  }
}

export class CreateCompany {
  constructor(private readonly companies: CompanyRepository) {}

  execute(input: CompanyInput): Promise<Company> {
    return this.companies.create(input);
  }
}

export class UpdateCompany {
  constructor(private readonly companies: CompanyRepository) {}

  execute(id: number, input: CompanyInput): Promise<Company> {
    return this.companies.update(id, input);
  }
}

export class DeleteCompany {
  constructor(private readonly companies: CompanyRepository) {}

  execute(id: number): Promise<void> {
    return this.companies.remove(id);
  }
}
