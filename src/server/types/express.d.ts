import { Request, Response, NextFunction } from 'express';

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export type AsyncRequestHandler<T = any> = (
  req: TypedRequestBody<T>,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
