import { Request, Response } from 'express';
import { PersonaService } from '../services/persona.service';
import { Persona } from '../models/persona';
import logger from '../config/logger';

export class PersonaController {
    private service: PersonaService;

    constructor(personaService: PersonaService) {
        this.service = personaService;
    }

    getPersonas = async (req: Request, res: Response): Promise<void> => {
        logger.info('[PersonaController] Solicitud para obtener todas las personas resumidas.');
        try {
            const resultado = await this.service.getPersonasResumidas();
            logger.debug(`[PersonaController] ${resultado.length} personas resumidas encontradas.`);
            res.status(200).json(resultado);
        } catch (error: any) {
            logger.error(`[PersonaController] Error al obtener personas: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al obtener personas' });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[PersonaController] Solicitud de persona por ID: ${id}`);
        try {
            const persona: Persona | null = await this.service.getById(id); 

            if (!persona) {
                logger.warn(`[PersonaController] Persona no encontrada con ID: ${id}`);
                res.status(404).json({ message: 'Persona no encontrada' });
                return;
            }

            const personaParaFrontend: Persona = persona;

            logger.debug(`[PersonaController] Datos de la persona ID ${id} enviados al frontend: ${JSON.stringify(personaParaFrontend.nombre)} ${JSON.stringify(personaParaFrontend.apellido)}`);
            res.status(200).json(personaParaFrontend);
        } catch (error: any) {
            logger.error(`[PersonaController] Error al obtener persona por ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al obtener persona por ID' });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const personaActualizadaData: Partial<Persona> = req.body;

        logger.info(`[PersonaController] Recibiendo PUT para actualizar persona ID: ${id}`);
        logger.debug(`[PersonaController] Datos recibidos para actualizar persona ID ${id}: ${JSON.stringify(personaActualizadaData)}`);

        try {
            const personaActualizada: Persona | null = await this.service.update(id, personaActualizadaData);

            if (!personaActualizada) {
                logger.warn(`[PersonaController] Persona no encontrada para actualizar con ID: ${id}. Devolviendo 404.`);
                res.status(404).json({ message: 'Persona no encontrada' });
                return;
            }

            logger.info(`[PersonaController] Persona ID ${id} actualizada con éxito.`);
            const personaParaFrontend: Persona = personaActualizada;
            res.status(200).json(personaParaFrontend); 
        } catch (error: any) {
            logger.error(`[PersonaController] Error al actualizar persona ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al actualizar persona', error: error.message });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        logger.info('[PersonaController] Intento de creación de nueva persona.');
        const personaData: Omit<Persona, 'id'> = req.body;

        try {
            const nuevaPersona: Persona = await this.service.create(personaData);

            logger.info(`[PersonaController] Persona creada con éxito. ID: ${nuevaPersona.id}`);

            const personaParaFrontend: Persona = nuevaPersona;
            res.status(201).json(personaParaFrontend);
        } catch (error: any) {
            logger.error(`[PersonaController] Error al crear persona: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al crear persona', error: error.message });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[PersonaController] Intento de eliminación de persona ID: ${id}`);
        try {
            const eliminado = await this.service.delete(id);
            if (!eliminado) {
                logger.warn(`[PersonaController] Persona no encontrada para eliminar con ID: ${id}.`);
                res.status(404).json({ message: 'Persona no encontrada' });
                return;
            }
            logger.info(`[PersonaController] Persona ID: ${id} eliminada con éxito.`);
            res.status(204).end();
        } catch (error: any) {
            logger.error(`[PersonaController] Error al eliminar persona ID ${id}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Error interno del servidor al eliminar persona' });
        }
    };
}