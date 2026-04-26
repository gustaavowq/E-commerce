// Tipo dedicado pra ApiError pra evitar dependência circular com api.ts.
export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static is(err: unknown): err is ApiError {
    return err instanceof ApiError
  }
}
