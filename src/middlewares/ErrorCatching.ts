import { NextFunction, Request, Response } from 'express';
import { catching } from '../helpers/catching';

// Atrapa los errores en un único punto. Tener en cuenta que la función debe
// declarar 4 parametros, incluso si no los usa todos, para que express lo
// reconozca como manejador de errores

export const ErrorCatching = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    catching(err, {
        NonExistentElement: () => {
            res.status(404).json();
        },
        InvalidData: (error) => {
            res.status(400).json(error.errors);
        },
        default: (error) => {
            res.status(500).json({ code: 500, message: error.message });
        }
    });
    next();
};
