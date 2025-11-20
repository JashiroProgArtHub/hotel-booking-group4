import { ZodError } from 'zod';
import { ValidationError } from './errorHandler.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validated = schema.parse(dataToValidate);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return next(new ValidationError('Validation failed', details));
      }

      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');

export const validateQuery = (schema) => validate(schema, 'query');

export const validateParams = (schema) => validate(schema, 'params');
