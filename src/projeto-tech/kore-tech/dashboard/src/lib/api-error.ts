// ApiError tipado pra UI distinguir 401 (login) vs 403 (forbidden) vs erro de servidor.
export class ApiError extends Error {
  status: number
  code:   string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code   = code
    this.details = details
  }

  static is(err: unknown): err is ApiError {
    return err instanceof ApiError
  }
}
