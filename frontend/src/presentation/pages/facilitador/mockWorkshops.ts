import { useCallback, useSyncExternalStore } from 'react';

export interface FacilitatorWorkshop {
  id: number;
  companyId: number;
  datetime: string;
  address: string;
  checkinLink: string;
  assessmentLink: string;
  checkInsCount: number;
  averageScore: number | null;
}

export interface WorkshopDraft {
  companyId: number;
  datetime: string;
  address: string;
  checkinLink: string;
  assessmentLink: string;
}

export interface MockCompany {
  id: number;
  name: string;
}

export const MOCK_COMPANIES: MockCompany[] = [
  { id: 1, name: 'ACME Ltda' },
  { id: 2, name: 'Empresa Fantasia' },
  { id: 3, name: 'Grupo Aurora' },
];

function at(daysFromNow: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);

  return date.toISOString();
}

let workshops: FacilitatorWorkshop[] = [
  {
    id: 104,
    companyId: 2,
    datetime: at(6, 14),
    address: 'Auditório - Matriz',
    checkinLink: 'https://mentis.kassiosousa.com.br/checkin/104',
    assessmentLink: 'https://mentis.kassiosousa.com.br/avaliacao/104',
    checkInsCount: 0,
    averageScore: null,
  },
  {
    id: 103,
    companyId: 1,
    datetime: at(2, 9),
    address: 'Sala de treinamento 3',
    checkinLink: 'https://mentis.kassiosousa.com.br/checkin/103',
    assessmentLink: 'https://mentis.kassiosousa.com.br/avaliacao/103',
    checkInsCount: 0,
    averageScore: null,
  },
  {
    id: 102,
    companyId: 3,
    datetime: at(-9, 15),
    address: 'Refeitório - Unidade Norte',
    checkinLink: 'https://mentis.kassiosousa.com.br/checkin/102',
    assessmentLink: 'https://mentis.kassiosousa.com.br/avaliacao/102',
    checkInsCount: 24,
    averageScore: 9.2,
  },
  {
    id: 101,
    companyId: 1,
    datetime: at(-23, 10),
    address: 'Auditório - Matriz',
    checkInsCount: 31,
    averageScore: 8.4,
    checkinLink: 'https://mentis.kassiosousa.com.br/checkin/101',
    assessmentLink: 'https://mentis.kassiosousa.com.br/avaliacao/101',
  },
];

let nextId = 105;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useMockWorkshops(): FacilitatorWorkshop[] {
  return useSyncExternalStore(
    useCallback((listener: () => void) => subscribe(listener), []),
    () => workshops,
  );
}

export function createMockWorkshop(draft: WorkshopDraft): void {
  workshops = [
    { id: nextId, checkInsCount: 0, averageScore: null, ...draft },
    ...workshops,
  ];
  nextId += 1;
  emit();
}

export function updateMockWorkshop(id: number, draft: WorkshopDraft): void {
  workshops = workshops.map((workshop) =>
    workshop.id === id ? { ...workshop, ...draft } : workshop,
  );
  emit();
}

export function removeMockWorkshop(id: number): void {
  workshops = workshops.filter((workshop) => workshop.id !== id);
  emit();
}

export function companyNameOf(id: number): string {
  return MOCK_COMPANIES.find((company) => company.id === id)?.name ?? `Empresa #${id}`;
}

export function isPastWorkshop(workshop: FacilitatorWorkshop, now: Date = new Date()): boolean {
  const date = new Date(workshop.datetime);

  return !Number.isNaN(date.getTime()) && date.getTime() < now.getTime();
}
