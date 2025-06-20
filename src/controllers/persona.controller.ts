import { Request, Response } from 'express';
import { PersonaService } from '../services/persona.service';
import { Persona } from '../models/persona'; 
import logger from '../config/logger'; 

export class PersonaController {
    private service: PersonaService; 

    constructor(private personaService: PersonaService) {
        this.service = personaService; 
    }

    getPersonas = async (req: Request, res: Response): Promise<void> => {
        logger.info('[PersonaController] Solicitud para obtener todas las personas resumidas.');
        const resultado = await this.service.getPersonasResumidas();
        logger.debug(`[PersonaController] ${resultado.length} personas resumidas encontradas.`);
        res.status(200).json(resultado);
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[PersonaController] Solicitud de persona por ID: ${id}`);
        const personaWithId = await this.service.getById(id); 

        if (!personaWithId) {
            logger.warn(`[PersonaController] Persona no encontrada con ID: ${id}`);
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }

        const normalizedId: string = typeof personaWithId._id === 'string' 
            ? personaWithId._id 
            : personaWithId._id.toHexString();

        const personaParaFrontend: Persona = {
            id: normalizedId, 
            dni: personaWithId.dni,
            nombre: personaWithId.nombre,
            apellido: personaWithId.apellido,
            fechaDeNacimiento: personaWithId.fechaDeNacimiento,
            genero: personaWithId.genero,
            donanteOrganos: personaWithId.donanteOrganos,
            autos: personaWithId.autos, 
        };

        logger.debug(`[PersonaController] Datos de la persona ID ${id} enviados al frontend: ${JSON.stringify(personaParaFrontend.nombre)} ${JSON.stringify(personaParaFrontend.apellido)}`);
        res.status(200).json(personaParaFrontend); 
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const personaActualizadaData: Partial<Persona> = req.body; 

        logger.info(`[PersonaController] Recibiendo PUT para actualizar persona ID: ${id}`);
        logger.debug(`[PersonaController] Datos recibidos para actualizar persona ID ${id}: ${JSON.stringify(personaActualizadaData)}`);

        const personaActualizada = await this.service.update(id, personaActualizadaData);
        
        if (!personaActualizada) {
            logger.warn(`[PersonaController] Persona no encontrada para actualizar con ID: ${id}. Devolviendo 404.`);
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }

        const normalizedId: string = typeof personaActualizada._id === 'string'
            ? personaActualizada._id
            : personaActualizada._id.toHexString();

        logger.info(`[PersonaController] Persona ID ${id} actualizada con éxito.`);
        const personaParaFrontend: Persona = {
            id: normalizedId, 
            dni: personaActualizada.dni,
            nombre: personaActualizada.nombre,
            apellido: personaActualizada.apellido,
            fechaDeNacimiento: personaActualizada.fechaDeNacimiento,
            genero: personaActualizada.genero,
            donanteOrganos: personaActualizada.donanteOrganos,
            autos: personaActualizada.autos,
        };
        res.status(201).json(personaParaFrontend); 
    };

    create = async (req: Request, res: Response): Promise<void> => {
        logger.info('[PersonaController] Intento de creación de nueva persona.');
        const personaData: Omit<Persona, '_id' | 'id'> = req.body; 
        
        const nuevaPersona = await this.service.create(personaData); 
        
        const normalizedId: string = typeof nuevaPersona._id === 'string'
            ? nuevaPersona._id
            : nuevaPersona._id.toHexString();

        logger.info(`[PersonaController] Persona creada con éxito. ID: ${normalizedId}`);

        const personaParaFrontend: Persona = {
            id: normalizedId, 
            dni: nuevaPersona.dni,
            nombre: nuevaPersona.nombre,
            apellido: nuevaPersona.apellido,
            fechaDeNacimiento: nuevaPersona.fechaDeNacimiento,
            genero: nuevaPersona.genero,
            donanteOrganos: nuevaPersona.donanteOrganos,
            autos: nuevaPersona.autos, 
        };
        res.status(201).json(personaParaFrontend); 
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        logger.info(`[PersonaController] Intento de eliminación de persona ID: ${id}`);
        const eliminado = await this.service.delete(id);
        if (!eliminado) {
            logger.warn(`[PersonaController] Persona no encontrada para eliminar con ID: ${id}.`);
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }
        logger.info(`[PersonaController] Persona ID: ${id} eliminada con éxito.`);
        res.status(204).end();
    };
}