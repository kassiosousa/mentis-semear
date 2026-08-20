import type { User } from '@/domain/auth/entities/User';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserPage,
  UserRepository,
} from '@/domain/user/repositories/UserRepository';
import { toUser, type UserApiModel } from '@/infrastructure/auth/authMappers';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface UsersApiPage {
  data?: UserApiModel[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

function toCreateBody(input: CreateUserInput) {
  return {
    name: input.name,
    email: input.email,
    password: input.password,
    type: input.type,
    company_id: input.companyId ?? null,
  };
}

function toUpdateBody(input: UpdateUserInput) {
  const body: Record<string, unknown> = {};

  if (input.name !== undefined) body.name = input.name;
  if (input.email !== undefined) body.email = input.email;
  if (input.password !== undefined) body.password = input.password;
  if (input.type !== undefined) body.type = input.type;
  if (input.companyId !== undefined) body.company_id = input.companyId;

  return body;
}

export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: UserFilters = {}): Promise<UserPage> {
    const payload = await this.http.get<UsersApiPage | UserApiModel[]>('/users', {
      params: { type: filters.type, page: filters.page },
    });

    if (Array.isArray(payload)) {
      return {
        users: payload.map(toUser),
        currentPage: 1,
        perPage: payload.length,
        total: payload.length,
      };
    }

    const models = payload.data ?? [];

    return {
      users: models.map(toUser),
      currentPage: payload.current_page ?? 1,
      perPage: payload.per_page ?? models.length,
      total: payload.total ?? models.length,
    };
  }

  async create(input: CreateUserInput): Promise<User> {
    const payload = await this.http.post<unknown>('/users', toCreateBody(input));

    return toUser(unwrap<UserApiModel>(payload));
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const payload = await this.http.put<unknown>(`/users/${id}`, toUpdateBody(input));

    return toUser(unwrap<UserApiModel>(payload));
  }

  async remove(id: string): Promise<void> {
    await this.http.delete<unknown>(`/users/${id}`);
  }
}
