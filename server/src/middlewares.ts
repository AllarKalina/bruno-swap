import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export function validateRequest(validators: {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        req.params = await validators.params.parseAsync(req.params);
      }
      if (validators.body) {
        req.body = await validators.body.parseAsync(req.body);
      }
      if (validators.query) {
        req.query = await validators.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422);
      }
      next(error);
    }
  };
}

export function errorHandler(
  err: Error,
  _: Request,
  res: Response<{ message: string }>
) {
  console.log(res);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
  });
}
