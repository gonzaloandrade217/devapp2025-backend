import { WithId, ObjectId } from "mongodb";
import { Persona } from "../models/persona";
import { IService } from "./IService"; 
import { IRepository } from '../repositories/IRepository';
import { Auto } from '../models/auto';
import logger from "../config/logger";
import { IAutoRepository } from "../repositories/IAutoRepository";

export class PersonaService implements IService<Persona, string | ObjectId> { 
    private personaRepository: IRepository<Persona, string> | IRepository<Persona, ObjectId>; 
    private autoRepository: IAutoRepository<string> | IAutoRepository<ObjectId>; 

    constructor(
        personaRepository: IRepository<Persona, string> | IRepository<Persona, ObjectId>,
        autoRepository: IAutoRepository<string> | IAutoRepository<ObjectId>
    ) {
        this.personaRepository = personaRepository;
        this.autoRepository = autoRepository;
        logger.info("[PersonaService] Instancia creada."); 
    }

    public async getAll(): Promise<(Persona & { _id: string | ObjectId })[]> {
        logger.info("[PersonaService] Intentando obtener todas las personas.");
        try {
            const personas = await this.personaRepository.getAll();
            logger.debug(`[PersonaService] Se encontraron ${personas.length} personas.`);
            return personas;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al obtener todas las personas: ${error.message}`, { stack: error.stack });
            throw error; 
        }
    }

    public async getById(id: string): Promise<(Persona & { _id: string | ObjectId }) | null> {
        logger.info(`[PersonaService] Intentando obtener persona por ID: ${id}`);
        try {
            const personaDoc = await this.personaRepository.getById(id);

            if (!personaDoc) {
                logger.warn(`[PersonaService] Persona no encontrada para el ID: ${id}`);
                return null;
            }

            const personaIdString: string = typeof personaDoc._id === 'string' 
                ? personaDoc._id 
                : personaDoc._id.toHexString();

            let autosAsociados: Auto[] = [];

            try {
                const autosDocs = await this.autoRepository.getByPersonaId(personaIdString);

                autosAsociados = autosDocs.map(autoDoc => {
                    const autoIdString = typeof autoDoc._id === 'string' 
                        ? autoDoc._id 
                        : autoDoc._id.toHexString();
                    return {
                        id: autoIdString,
                        patente: autoDoc.patente,
                        marca: autoDoc.marca,
                        modelo: autoDoc.modelo,
                        anio: autoDoc.anio,
                        color: autoDoc.color,
                        nroChasis: autoDoc.nroChasis,
                        nroMotor: autoDoc.nroMotor,
                        personaID: autoDoc.personaID,
                    } as Auto;
                });
                logger.debug(`[PersonaService] Se encontraron ${autosAsociados.length} autos asociados para la persona ID: ${personaIdString}`);

            } catch (error: any) {
                logger.error(`[PersonaService] Error al obtener autos para persona ID ${personaIdString}: ${error.message}`, { stack: error.stack });
                autosAsociados = [];
            }

            const personaFinal: Persona & { _id: string | ObjectId } = {
                ...personaDoc,
                autos: autosAsociados 
            };

            logger.info(`[PersonaService] Persona ID ${id} recuperada con éxito, incluyendo sus autos asociados.`);
            return personaFinal;
        } catch (error: any) {
            logger.error(`[PersonaService] Error en getById para ID ${id}: ${error.message}`, { stack: error.stack });
            throw error; 
        }
    }

    public async create(personaData: Omit<Persona, '_id' | 'id'>): Promise<(Persona & { _id: string | ObjectId })> {
        logger.info("[PersonaService] Iniciando la creación de una nueva persona.");
        if (!personaData.nombre || !personaData.dni) {
            logger.warn("[PersonaService] Intento de creación de persona sin campos obligatorios (nombre o DNI).");
            throw new Error('Nombre y DNI son campos obligatorios');
        }

        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            logger.warn(`[PersonaService] Intento de creación de persona con formato de DNI inválido: ${personaData.dni}`);
            throw new Error('Formato de DNI inválido');
        }

        const dataToCreate: Omit<Persona, '_id' | 'id'> = { ...personaData };

        if ('fechaDeNacimiento' in dataToCreate && typeof (dataToCreate as any).fechaDeNacimiento === 'string' && !isNaN(new Date((dataToCreate as any).fechaDeNacimiento).getTime())) {
            (dataToCreate as any).fechaDeNacimiento = new Date((dataToCreate as any).fechaDeNacimiento);
            logger.debug("[PersonaService] Conversión de fecha (CREATE) aplicada. Fecha después de la conversión:", (dataToCreate as any).fechaDeNacimiento);
        } else {
            logger.debug("[PersonaService] Conversión de fecha (CREATE) NO aplicada. Tipo o valor inesperado para fechaDeNacimiento:", typeof (dataToCreate as any).fechaDeNacimiento, (dataToCreate as any).fechaDeNacimiento);
        }

        try {
            const createdPersona = await this.personaRepository.create(dataToCreate);

            const createdPersonaIdString = typeof createdPersona._id === 'string' ? createdPersona._id : createdPersona._id.toHexString();
            
            const personaWithEmptyAutos: Persona & { _id: string | ObjectId } = {
                ...createdPersona,
                autos: [] 
            };
            logger.info(`[PersonaService] Persona creada con éxito. ID: ${createdPersonaIdString}`);
            return personaWithEmptyAutos;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al crear persona: ${error.message}`, { stack: error.stack, personaData: personaData });
            throw error; 
        }
    }

    public async update(id: string, personaData: Partial<Persona>): Promise<(Persona & { _id: string | ObjectId }) | null> {
        logger.info(`[PersonaService] Iniciando la actualización para la persona con ID: ${id}`);
        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            logger.warn(`[PersonaService] Intento de actualización de persona con ID ${id} con formato de DNI inválido: ${personaData.dni}`);
            throw new Error('Formato de DNI inválido');
        }

        const dataToUpdate: Partial<Persona> = { ...personaData };

        if ('fechaDeNacimiento' in dataToUpdate && typeof (dataToUpdate as any).fechaDeNacimiento === 'string' && !isNaN(new Date((dataToUpdate as any).fechaDeNacimiento).getTime())) {
            (dataToUpdate as any).fechaDeNacimiento = new Date((dataToUpdate as any).fechaDeNacimiento);
            logger.debug("[PersonaService] Conversión de fecha (UPDATE) aplicada. Fecha después de la conversión:", (dataToUpdate as any).fechaDeNacimiento);
        } else {
            logger.debug("[PersonaService] Conversión de fecha (UPDATE) NO aplicada. Tipo o valor inesperado para fechaDeNacimiento:", typeof (dataToUpdate as any).fechaDeNacimiento, (dataToUpdate as any).fechaDeNacimiento);
        }

        try {
            logger.debug(`[PersonaService] Intentando actualizar Persona con ID: ${id}. Datos enviados: ${JSON.stringify(dataToUpdate)}`);
            const updated = await this.personaRepository.update(id, dataToUpdate);
            
            if (!updated) {
                logger.warn(`[PersonaService] El repositorio no pudo actualizar/encontrar la Persona con ID: ${id}.`);
                return null;
            }
            
            const updatedPersonaIdString = typeof updated._id === 'string' ? updated._id : updated._id.toHexString();
            logger.info(`[PersonaService] El repositorio actualizó la Persona con éxito. ID: ${updatedPersonaIdString}`);

            const personaIdForAutoQuery = typeof updated._id === 'string' 
                ? updated._id 
                : updated._id.toHexString();

            let autosAsociados: Auto[] = [];
            try {
                autosAsociados = (await this.autoRepository.getByPersonaId(personaIdForAutoQuery)).map(autoDoc => {
                    const autoIdString = typeof autoDoc._id === 'string' 
                        ? autoDoc._id 
                        : autoDoc._id.toHexString();
                    return { ...autoDoc, id: autoIdString } as Auto;
                });
                logger.debug(`[PersonaService] Se encontraron ${autosAsociados.length} autos asociados durante la actualización para la persona ID: ${personaIdForAutoQuery}`);
            } catch (error: any) {
                logger.error(`[PersonaService] Error al obtener autos para persona ID ${personaIdForAutoQuery} durante la actualización: ${error.message}`, { stack: error.stack });
                autosAsociados = [];
            }

            const updatedPersonaWithAutos: Persona & { _id: string | ObjectId } = {
                ...updated,
                autos: autosAsociados
            };

            logger.info(`[PersonaService] Persona ID ${id} actualizada y preparada con autos asociados.`);
            return updatedPersonaWithAutos;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al actualizar persona ID ${id}: ${error.message}`, { stack: error.stack, updateData: personaData });
            throw error; 
        }
    }

    public async delete(id: string): Promise<boolean> {
        logger.info(`[PersonaService] Iniciando la eliminación de la persona con ID: ${id}`);
        try {
            const deleted = await this.personaRepository.delete(id);
            if (deleted) {
                logger.info(`[PersonaService] Persona ID ${id} eliminada con éxito.`);
            } else {
                logger.warn(`[PersonaService] Persona ID ${id} no encontrada para eliminar.`);
            }
            return deleted;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al eliminar persona ID ${id}: ${error.message}`, { stack: error.stack });
            throw error; 
        }
    }

    public async getPersonasResumidas(): Promise<{
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
        genero: string;
        donanteOrganos: boolean
    }[]> {
        logger.info("[PersonaService] Obteniendo lista resumida de personas.");
        try {
            const personas = await this.personaRepository.getAll();
            const resumidas = personas.map(p => ({
                id: typeof p._id === 'string' ? p._id : p._id.toHexString(),
                nombre: p.nombre,
                apellido: p.apellido,
                dni: p.dni,
                genero: p.genero,
                donanteOrganos: p.donanteOrganos
            }));
            logger.debug(`[PersonaService] Se generaron ${resumidas.length} personas resumidas.`);
            return resumidas;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al obtener personas resumidas: ${error.message}`, { stack: error.stack });
            throw error; 
        }
    }

    private validarDNI(dni: string): boolean {
        const isValid = /^\d{7,8}$/.test(dni);
        if (!isValid) {
            logger.debug(`[PersonaService] Falló la validación de DNI para: ${dni}`);
        }
        return isValid;
    }
}