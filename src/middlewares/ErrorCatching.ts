import { NextFunction, Request, Response } from 'express';
import { catching } from '../helpers/catching';
import logger from '../config/logger'; 

export const ErrorCatching = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`[Error] - ${req.method} ${req.originalUrl} - ${err.message}`, {
        stack: err.stack,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    catching(err, {
        NonExistentElement: () => {
            logger.warn(`[404 Not Found] - ${req.method} ${req.originalUrl}: ${err.message}`); 
            res.status(404).json();
        },
        InvalidData: (error) => {
            logger.info(`[400 Bad Request] - ${req.method} ${req.originalUrl}: Datos inválidos - ${JSON.stringify(error.errors)}`); 
            res.status(400).json(error.errors);
        },
        default: (error) => {
            res.status(500).json({ code: 500, message: error.message });
        }
    });
};