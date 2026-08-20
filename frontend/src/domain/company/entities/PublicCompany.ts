export interface PublicSector {
  id: number;
  name: string;
}

export interface PublicCompany {
  id: number;
  name: string;
  sectors: PublicSector[];
}
