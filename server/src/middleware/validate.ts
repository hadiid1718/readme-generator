/**
 * Validation Middleware
 * Validates request body against Zod schemas
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replace with parsed/sanitized data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: messages,
        });
        return;
      }
      next(error);
    }
  };
};
