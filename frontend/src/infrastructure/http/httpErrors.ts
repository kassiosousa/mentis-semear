import { AxiosError } from 'axios';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  ServerError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from '@/domain/shared/errors/AppError';

interface LaravelErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

function bodyOf(error: AxiosError): LaravelErrorBody {
  const data = error.response?.data;
  return typeof data === 'object' && data !== null ? (data as LaravelErrorBody) : {};
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (!(error instanceof AxiosError)) {
    return new AppError('Erro inesperado.', { cause: error });
  }

  const status = error.response?.status;
  const body = bodyOf(error);
  const message = body.message ?? error.message;

  if (status === undefined) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new NetworkError(
      timedOut ? 'A requisição excedeu o tempo limite.' : 'Não foi possível conectar ao servidor.',
      { cause: error },
    );
  }

  switch (status) {
    case 401:
      return new UnauthorizedError(message || 'Sessão expirada.', { cause: error });
    case 403:
      return new ForbiddenError(message || 'Você não tem permissão para esta ação.', {
        cause: error,
      });
    case 404:
      return new NotFoundError(message || 'Recurso não encontrado.', { cause: error });
    case 409:
      return new ConflictError(message || 'Conflito com o estado atual do recurso.', {
        cause: error,
      });
    case 422:
      return new ValidationError(message || 'Dados inválidos.', body.errors ?? {}, { cause: error });
    case 429:
      return new TooManyRequestsError(message || 'Muitas requisições. Tente novamente em instantes.', {
        cause: error,
      });
    default:
      return status >= 500
        ? new ServerError(message || 'Erro interno do servidor.', { cause: error })
        : new AppError(message || 'Erro na requisição.', { cause: error });
  }
}