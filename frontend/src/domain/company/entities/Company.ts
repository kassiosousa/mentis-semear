export interface Company {
  id: number;
  name: string;
  address: string;
  email: string;
  token: string | null;
  thermometerLink: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CompanyInput {
  name: string;
  address: string;
  email: string;
}

export function thermometerLinkOf(company: Company, origin: string): string | null {
  if (company.thermometerLink !== null) return company.thermometerLink;
  if (company.token === null) return null;

  return `${origin.replace(/\/$/, '')}/termometro/${company.token}`;
}
