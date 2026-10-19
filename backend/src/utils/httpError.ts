export interface HttpErrorDetails {
  path: string;
  message: string;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: HttpErrorDetails[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: HttpErrorDetails[],
  ) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
