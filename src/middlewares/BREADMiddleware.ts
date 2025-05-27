import { NextFunction, Request, Response } from 'express';
import { ObjectId, WithId } from 'mongodb';
import { Validation } from '../models/validations';
import { IService } from '../services/IService';

export abstract class BREADMiddleware<T, ListingDTO, FullEntityDTO, TInputEntity = T, ReposEntity extends T & { _id: ObjectId } = T & { _id: ObjectId }> {
    protected service: IService<T>;

    protected abstract entityToListingEntity: (entity: ReposEntity) => ListingDTO;
    protected abstract entityToFullEntity: (entity: ReposEntity) => FullEntityDTO;

    protected abstract validatedEntity: (entity: TInputEntity) => Validation<T>;

    constructor(service: IService<T>) {
        this.service = service;
    }

    public fetchEntityByParamId = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id;
            const entity = await this.service.getById(id);
            if (!entity) {
                res.status(404).json({ message: 'Entidad no encontrada' });
                return;
            }
            req.locals.entity = entity as ReposEntity; 
            next();
        } catch (error) {
            console.error('Error en BREADMiddleware.fetchEntityByParamId:', error);
            res.status(500).json({ error: 'Error al obtener entidad por ID' });
        }
    };

    public fetchEntityFromBody = (req: Request, res: Response, next: NextFunction): void => {
        req.locals.entity = req.body as TInputEntity; 
        next();
    };

    public mergeEntityWithBody = (req: Request, res: Response, next: NextFunction): void => {
        const existingEntity = req.locals.entity; 
        const bodyData: TInputEntity = req.body; 
        
        const newEntity: Partial<ReposEntity> = { ...existingEntity, ...bodyData };
        req.locals.entity = newEntity;
        next();
    };

    public validateEntity = (req: Request, res: Response, next: NextFunction): void => {
        const entityToValidate: TInputEntity = req.locals.entity as TInputEntity; 
        const validation = this.validatedEntity(entityToValidate);
        if (!validation.success) {
            res.status(400).json({ error: 'Error de validación', details: validation.error });
            return;
        }
        req.locals.entity = validation.data; 
        next();
    };

    public sendListingResponse = (req: Request, res: Response, next: NextFunction): void => {
        const entityOrEntities: ReposEntity | ReposEntity[] = res.locals.data;
        if (!entityOrEntities) {
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
        const entityOrEntities: ReposEntity | ReposEntity[] = res.locals.data;
        if (!entityOrEntities) {
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