import type { User } from '@/domain/auth/entities/User';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserFilters,
  UserPage,
  UserRepository,
} from '@/domain/user/repositories/UserRepository';

export class ListUsers {
  constructor(private readonly users: UserRepository) {}

  execute(filters: UserFilters = {}): Promise<UserPage> {
    return this.users.list(filters);
  }
}

export class CreateUser {
  constructor(private readonly users: UserRepository) {}

  execute(input: CreateUserInput): Promise<User> {
    return this.users.create(input);
  }
}

export class UpdateUser {
  constructor(private readonly users: UserRepository) {}

  execute(id: string, input: UpdateUserInput): Promise<User> {
    return this.users.update(id, input);
  }
}

export class DeleteUser {
  constructor(private readonly users: UserRepository) {}

  execute(id: string): Promise<void> {
    return this.users.remove(id);
  }
}
