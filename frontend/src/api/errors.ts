import { AxiosError } from 'axios';

interface ApiErrorBody {
  error?: string;
  details?: Record<string, string[]>;
}

export function isApiError(err: unknown): err is AxiosError<ApiErrorBody> {
  return err instanceof AxiosError;
}
