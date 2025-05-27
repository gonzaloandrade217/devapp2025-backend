/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

// Cambia el send original del response por un send falso que guarda los datos
// de forma temporal, hasta que se llama a realSend.
// Notar que acá nos colgamos de JS más que TS, por lo que muchas cosas terminan
// siendo any.
export const ResponseInterceptor = (req: Request, res: Response, next: NextFunction): void => {
    (res as any).body = undefined;
    (res as any).originalJson = res.json;

    (res as any).json = (bodyContents?: any) => {
        (res as any).body = bodyContents;
    };
    (res as any).realJson = () => {
        res.json = (res as any).originalJson;
        return res.json((res as any).body);
    };
    next();
};

export const ResponseSender = (req: Request, res: Response): void => {
    (res as any).realJson();
};
