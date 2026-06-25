import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.statusCode,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Something went wrong. Please try again.',
    code: 500,
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
};
