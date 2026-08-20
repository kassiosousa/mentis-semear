export const LOG_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

export type LogMethod = (typeof LOG_METHODS)[number];

export interface Log {
  id: number;
  description: string;
  userId: string | null;
  createdAt: string | null;
}

export interface LogAction {
  method: LogMethod | null;
  path: string | null;
  status: number | null;
}

const ACTION_PATTERN = /^(POST|PUT|PATCH|DELETE)\s+(\S+)(?:\s+\((\d{3})\))?$/;

export function actionOf(log: Log): LogAction {
  const match = ACTION_PATTERN.exec(log.description.trim());

  if (match === null) return { method: null, path: null, status: null };

  return {
    method: match[1] as LogMethod,
    path: match[2],
    status: match[3] === undefined ? null : Number(match[3]),
  };
}

export function isSuccessStatus(status: number | null): boolean {
  return status !== null && status >= 200 && status < 300;
}
