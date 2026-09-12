export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function requireParam(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new AppError(400, 'Paramètre de route invalide');
  }
  return value;
}
