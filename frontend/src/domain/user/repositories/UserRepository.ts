import type { User, UserType } from '@/domain/auth/entities/User';

export interface UserFilters {
  type?: UserType;
  page?: number;
}

export interface UserPage {
  users: User[];
  currentPage: number;
  perPage: number;
  total: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  type: UserType;
  companyId?: number | null;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  type?: UserType;
  companyId?: number | null;
}

export interface UserRepository {
  list(filters?: UserFilters): Promise<UserPage>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  remove(id: string): Promise<void>;
}
