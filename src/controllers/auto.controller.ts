import { Request, Response } from 'express';
import { AutoService } from "../services/auto.service";
import { Auto } from '../models/auto';
import { WithId, ObjectId } from 'mongodb'; 
import logger from '../config/logger';

export class AutoController {
    private service: AutoService;

    constructor(private autoService: AutoService) {
        this.service = autoService;
    }

    public getAutos = async (req: Request, res: Response): Promise<void> => {
        const personaID = req.query.personaID as string | undefined;
        let autos: (Auto & { _id: string | ObjectId })[]; 

        logger.info(`[AutoController] Solicitud de autos. PersonaID: ${personaID || 'todos'}`);

        if (personaID) {
            autos = await this.service.getByPersonaId(personaID);
        } else {
            autos = await this.service.getAll();
        }
        logger.debug(`[AutoController] ${autos.length} autos encontrados para PersonaID: ${personaID || 'todos'}`);
        res.status(200).json(autos);
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[AutoController] Solicitud de auto por ID: ${id}`);
        const auto: (Auto & { _id: string | ObjectId }) | null = await this.service.getById(id);
        if (auto) {
            logger.debug(`[AutoController] Auto encontrado: ${id}`);
            res.status(200).json(auto);
        } else {
            logger.warn(`[AutoController] Auto no encontrado con ID: ${id}`);
            res.status(404).json({ message: 'Auto no encontrado' });
        }
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const autoData: Omit<Auto, '_id' | 'id'> = req.body; 
        logger.info(`[AutoController] Intento de creación de auto: ${JSON.stringify(autoData.marca)} - ${JSON.stringify(autoData.modelo)}`);
        const nuevoAuto: (Auto & { _id: string | ObjectId }) = await this.service.create(autoData);
        logger.info(`[AutoController] Auto creado con éxito. ID: ${nuevoAuto._id}`);
        res.status(201).json(nuevoAuto); 
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const autoData: Partial<Auto> = req.body;
        logger.info(`[AutoController] Intento de actualización de auto ID: ${id}. Datos: ${JSON.stringify(autoData)}`);
        const autoActualizado: (Auto & { _id: string | ObjectId }) | null = await this.service.update(id, autoData);
        if (autoActualizado) {
            logger.info(`[AutoController] Auto ID: ${id} actualizado con éxito.`);
            res.status(200).json(autoActualizado);
        } else {
            logger.warn(`[AutoController] No se pudo actualizar, auto no encontrado con ID: ${id}`);
            res.status(404).json({ message: 'Auto no encontrado' });
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[AutoController] Intento de eliminación de auto ID: ${id}`);
        const eliminado = await this.service.delete(id);
        if (eliminado) {
            logger.info(`[AutoController] Auto ID: ${id} eliminado con éxito.`);
            res.status(204).end(); 
        } else {
            logger.warn(`[AutoController] No se pudo eliminar, auto no encontrado con ID: ${id}`);
            res.status(404).json({ message: 'Auto no encontrado' });
        }
    };

    public getAutosByPersonaId = async (req: Request, res: Response): Promise<void> => {
        const { personaID } = req.params; 
        logger.info(`[AutoController] Solicitud de autos para PersonaID (desde params): ${personaID}`);
        const autos: (Auto & { _id: string | ObjectId })[] = await this.autoService.getByPersonaId(personaID);
        logger.debug(`[AutoController] ${autos.length} autos encontrados para PersonaID (desde params): ${personaID}`);
        res.status(200).json(autos);
    };
}