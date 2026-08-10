import {
  NetworkError,
  NotFoundError,
  TooManyRequestsError,
  ValidationError,
} from '@/domain/shared/errors/AppError';

const GENERIC_FIELD_ERROR = 'Confira este campo e tente novamente.';

export function describeError(error: unknown): string {
  if (error instanceof ValidationError) return 'Confira os campos destacados e tente novamente.';

  if (error instanceof TooManyRequestsError) {
    return 'Muitas tentativas seguidas. Aguarde um instante e tente novamente.';
  }

  if (error instanceof NotFoundError) return 'Este link não é válido.';

  if (error instanceof NetworkError) return error.message;

  return 'Não foi possível enviar agora. Tente novamente em instantes.';
}

export function toFormErrors(
  error: unknown,
  fieldByApiName: Record<string, string>,
  messageByApiName: Record<string, string> = {},
): Record<string, string> {
  if (!(error instanceof ValidationError)) return {};

  const errors: Record<string, string> = {};

  for (const apiName of Object.keys(error.fields)) {
    const field = fieldByApiName[apiName];
    if (field === undefined) continue;

    errors[field] = messageByApiName[apiName] ?? GENERIC_FIELD_ERROR;
  }

  return errors;
}
