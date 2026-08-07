export interface Envelope<T> {
  data: T;
}

export function unwrap<T>(payload: unknown): T {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as Envelope<T>).data;
  }

  return payload as T;
}