export const USER_TYPES = ['admin', 'facilitador', 'empresa', 'usuario'] as const;

export type UserType = (typeof USER_TYPES)[number];

export const DEFAULT_USER_TYPE: UserType = 'usuario';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  companyId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const USER_TYPE_LABELS: Record<UserType, string> = {
  admin: 'Administrador',
  facilitador: 'Facilitador',
  empresa: 'Empresa',
  usuario: 'Usuário',
};

export function isUserType(value: unknown): value is UserType {
  return USER_TYPES.includes(value as UserType);
}

export function hasType(user: User, ...types: readonly UserType[]): boolean {
  return types.includes(user.type);
}

export function labelOfType(type: UserType): string {
  return USER_TYPE_LABELS[type];
}
