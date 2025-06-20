import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Validation } from '../models/validations';
import { IService } from '../services/IService';
import logger from '../config/logger'; 

declare module 'express' {
    interface Request {
        locals?: {
            entity?: any;
        };
    }
    interface Response {
        locals?: {
            data?: any;
        };
    }
}

export abstract class BREADMiddleware<T, ListingDTO, FullEntityDTO, ID_TYPE = ObjectId, TInputEntity = T, ReposEntity extends T & { _id: ID_TYPE } = T & { _id: ID_TYPE }> {
    protected service: IService<T, ID_TYPE>;

    protected abstract entityToListingEntity: (entity: ReposEntity) => ListingDTO;
    protected abstract entityToFullEntity: (entity: ReposEntity) => FullEntityDTO;

    protected abstract validatedEntity: (entity: TInputEntity) => Validation<T>;

    constructor(service: IService<T, ID_TYPE>) {
        this.service = service;
    }

    public fetchEntityByParamId = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const entity = await this.service.getById(id);
            if (!entity) {
                logger.warn(`[BREADMiddleware] Entidad no encontrada por ID: ${id} en ${req.originalUrl}`);
                res.status(404).json({ message: 'Entidad no encontrada' });
                return; 
            }
            req.locals = { ...(req.locals || {}), entity: entity as ReposEntity }; 
            next();
        } catch (error: any) { 
            logger.error(`[BREADMiddleware] Error al obtener entidad por ID: ${req.params.id} en ${req.originalUrl}. Mensaje: ${error.message}`, {
                stack: error.stack,
                url: req.originalUrl,
                method: req.method,
                params: req.params
            });
            next(error); 
        }
    };

    public fetchEntityFromBody = (req: Request, res: Response, next: NextFunction): void => {
        req.locals = { ...(req.locals || {}), entity: req.body as TInputEntity };
        next();
    };

    public mergeEntityWithBody = (req: Request, res: Response, next: NextFunction): void => {
        const existingEntity = req.locals?.entity; 
        const bodyData: TInputEntity = req.body; 
        
        const newEntity: Partial<ReposEntity> = { ...existingEntity, ...bodyData, _id: existingEntity?._id };
        req.locals = { ...(req.locals || {}), entity: newEntity };
        next();
    };

    public validateEntity = (req: Request, res: Response, next: NextFunction): void => {
        const entityToValidate: TInputEntity = req.locals?.entity as TInputEntity; 
        const validation = this.validatedEntity(entityToValidate);
        if (!validation.success) {
            logger.info(`[BREADMiddleware] Error de validación para ${req.originalUrl}: ${JSON.stringify(validation.error)}`, {
                body: req.body,
                validationDetails: validation.error,
                method: req.method
            });
            res.status(400).json({ error: 'Error de validación', details: validation.error });
            return; 
        }
        req.locals = { ...(req.locals || {}), entity: validation.data }; 
        next();
    };

    public sendListingResponse = (req: Request, res: Response, next: NextFunction): void => {
        const entityOrEntities: ReposEntity | ReposEntity[] | undefined = res.locals?.data;
        if (!entityOrEntities || (Array.isArray(entityOrEntities) && entityOrEntities.length === 0)) {
            logger.info(`[BREADMiddleware] No hay contenido para listado en ${req.originalUrl}. Enviando 204.`);
            res.status(204).send();
            return;
        }

        let convertedToDto: ListingDTO | ListingDTO[];
        if (!Array.isArray(entityOrEntities)) {
            convertedToDto = this.entityToListingEntity(entityOrEntities);
        } else {
            convertedToDto = entityOrEntities.map(this.entityToListingEntity);
        }
        res.status(200).json(convertedToDto);
    };

    public sendFullEntityResponse = (req: Request, res: Response, next: NextFunction): void => {
        const entityOrEntities: ReposEntity | ReposEntity[] | undefined = res.locals?.data;
        if (!entityOrEntities || (Array.isArray(entityOrEntities) && entityOrEntities.length === 0)) {
            logger.info(`[BREADMiddleware] No hay contenido para entidad completa en ${req.originalUrl}. Enviando 204.`);
            res.status(204).send();
            return;
        }

        let convertedToDto: FullEntityDTO | FullEntityDTO[];
        if (!Array.isArray(entityOrEntities)) {
            convertedToDto = this.entityToFullEntity(entityOrEntities);
        } else {
            convertedToDto = entityOrEntities.map(this.entityToFullEntity);
        }
        res.status(200).json(convertedToDto);
    };
}