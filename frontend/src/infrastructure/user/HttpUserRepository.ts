import type { User } from '@/domain/auth/entities/User';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserPage,
  UserRepository,
} from '@/domain/user/repositories/UserRepository';
import { toUserEntity, type UserApiModel } from '@/infrastructure/auth/authMappers';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface UsersApiPage {
  data?: UserApiModel[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: UserFilters = {}): Promise<UserPage> {
    const payload = await this.http.get<UsersApiPage | UserApiModel[]>('/users', {
      params: { type: filters.type, page: filters.page },
    });

    if (Array.isArray(payload)) {
      return {
        users: payload.map(toUserEntity),
        currentPage: 1,
        perPage: payload.length,
        total: payload.length,
      };
    }

    const models = payload.data ?? [];

    return {
      users: models.map(toUserEntity),
      currentPage: payload.current_page ?? 1,
      perPage: payload.per_page ?? models.length,
      total: payload.total ?? models.length,
    };
  }

  async create(input: CreateUserInput): Promise<User> {
    const payload = await this.http.post<unknown>('/users', input);

    return toUserEntity(unwrap<UserApiModel>(payload));
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const payload = await this.http.put<unknown>(`/users/${id}`, input);

    return toUserEntity(unwrap<UserApiModel>(payload));
  }

  async remove(id: string): Promise<void> {
    await this.http.delete<unknown>(`/users/${id}`);
  }
}
