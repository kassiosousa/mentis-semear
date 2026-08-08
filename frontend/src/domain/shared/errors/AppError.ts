export class AppError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    readonly fields: Record<string, string[]> = {},
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class UnauthorizedError extends AppError {}

export class ForbiddenError extends AppError {}

export class NotFoundError extends AppError {}

export class ConflictError extends AppError {}

export class TooManyRequestsError extends AppError {}

export class ServerError extends AppError {}

export class NetworkError extends AppError {}