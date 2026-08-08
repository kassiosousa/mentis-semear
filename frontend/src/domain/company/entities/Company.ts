export interface Company {
  id: number;
  name: string;
  address: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CompanyInput {
  name: string;
  address: string;
  email: string;
}
