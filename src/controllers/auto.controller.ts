import { Request, Response } from 'express';
import { AutoService } from "../services/auto.service";
import { Auto } from '../models/auto';
import logger from '../config/logger';

export class AutoController {
    private service: AutoService;

    constructor(autoService: AutoService) {
        this.service = autoService;
    }

    public getAutos = async (req: Request, res: Response): Promise<void> => {
        const personaID = req.query.personaID as string | undefined;
        let autos: Auto[]; 

        logger.info(`[AutoController] Solicitud de autos. PersonaID: ${personaID || 'todos'}`);

        try {
            if (personaID) {
                autos = await this.service.getByPersonaId(personaID);
            } else {
                autos = await this.service.getAll();
            }
            logger.debug(`[AutoController] ${autos.length} autos encontrados para PersonaID: ${personaID || 'todos'}`);
            res.status(200).json(autos);
        } catch (error: any) {
            logger.error(`[AutoController] Error al obtener autos: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al obtener autos' });
        }
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[AutoController] Solicitud de auto por ID: ${id}`);
        try {
            const auto: Auto | null = await this.service.getById(id); 
            if (auto) {
                logger.debug(`[AutoController] Auto encontrado: ${id}`);
                res.status(200).json(auto);
            } else {
                logger.warn(`[AutoController] Auto no encontrado con ID: ${id}`);
                res.status(404).json({ message: 'Auto no encontrado' });
            }
        } catch (error: any) {
            logger.error(`[AutoController] Error al obtener auto por ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al obtener auto por ID' });
        }
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const autoData: Omit<Auto, 'id'> = req.body;
        logger.info(`[AutoController] Intento de creación de auto: ${JSON.stringify(autoData.marca)} - ${JSON.stringify(autoData.modelo)}`);
        try {
            const nuevoAuto: Auto = await this.service.create(autoData); 
            logger.info(`[AutoController] Auto creado con éxito. ID: ${nuevoAuto.id}`); 
            res.status(201).json(nuevoAuto);
        } catch (error: any) {
            logger.error(`[AutoController] Error al crear auto: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al crear auto', error: error.message });
        }
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const autoData: Partial<Auto> = req.body;
        logger.info(`[AutoController] Intento de actualización de auto ID: ${id}. Datos: ${JSON.stringify(autoData)}`);
        try {
            const autoActualizado: Auto | null = await this.service.update(id, autoData); 
            if (autoActualizado) {
                logger.info(`[AutoController] Auto ID: ${id} actualizado con éxito.`);
                res.status(200).json(autoActualizado);
            } else {
                logger.warn(`[AutoController] No se pudo actualizar, auto no encontrado con ID: ${id}`);
                res.status(404).json({ message: 'Auto no encontrado' });
            }
        } catch (error: any) {
            logger.error(`[AutoController] Error al actualizar auto ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al actualizar auto', error: error.message });
        }
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[AutoController] Intento de eliminación de auto ID: ${id}`);
        try {
            const eliminado = await this.service.delete(id);
            if (eliminado) {
                logger.info(`[AutoController] Auto ID: ${id} eliminado con éxito.`);
                res.status(204).end();
            } else {
                logger.warn(`[AutoController] No se pudo eliminar, auto no encontrado con ID: ${id}`);
                res.status(404).json({ message: 'Auto no encontrado' });
            }
        } catch (error: any) {
            logger.error(`[AutoController] Error al eliminar auto ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al eliminar auto' });
        }
    };

    public getAutosByPersonaId = async (req: Request, res: Response): Promise<void> => {
        const { personaID } = req.params;
        logger.info(`[AutoController] Solicitud de autos para PersonaID (desde params): ${personaID}`);
        try {
            const autos: Auto[] = await this.service.getByPersonaId(personaID); 
            logger.debug(`[AutoController] ${autos.length} autos encontrados para PersonaID (desde params): ${personaID}`);
            res.status(200).json(autos);
        } catch (error: any) {
            logger.error(`[AutoController] Error al obtener autos por PersonaID ${personaID}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al obtener autos por PersonaID' });
        }
    };
}