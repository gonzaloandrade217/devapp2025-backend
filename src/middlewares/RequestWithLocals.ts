import { NextFunction, Request, Response } from 'express';

// Configura locals como un objeto en todos los requests. Debe ser usado para todo
// request previo a cualquier otro procesado.
export const RequestWithLocals = (req: Request, res: Response, next: NextFunction): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).locals = {};
    next();
};
