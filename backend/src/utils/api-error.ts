/**
 * Custom API error class with status code and optional details
 */
export class ApiError extends Error {
  statusCode: number
  details?: unknown

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.details = details
    this.name = "ApiError"

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}
