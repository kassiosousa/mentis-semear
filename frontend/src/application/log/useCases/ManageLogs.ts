import type { Log } from '@/domain/log/entities/Log';
import type { LogFilters, LogPage, LogRepository } from '@/domain/log/repositories/LogRepository';

export class ListLogs {
  constructor(private readonly logs: LogRepository) {}

  execute(filters: LogFilters = {}): Promise<LogPage> {
    return this.logs.list(filters);
  }
}

export class FindLog {
  constructor(private readonly logs: LogRepository) {}

  execute(id: number): Promise<Log> {
    return this.logs.find(id);
  }
}
