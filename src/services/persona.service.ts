import { Persona } from "../models/persona";
import { IService } from "./IService";
import { IRepository } from '../repositories/IRepository';
import { Auto } from '../models/auto';
import logger from "../config/logger";
import { IAutoRepository } from "../repositories/IAutoRepository";
import { Temporal } from 'temporal-polyfill'; 

export class PersonaService implements IService<Persona, string> {
    private personaRepository: IRepository<Persona, string>;
    private autoRepository: IAutoRepository<string>;

    constructor(
        personaRepository: IRepository<Persona, string>,
        autoRepository: IAutoRepository<string>
    ) {
        this.personaRepository = personaRepository;
        this.autoRepository = autoRepository;
        logger.info("[PersonaService] Instancia creada.");
    }

    public async getAll(): Promise<Persona[]> {
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

    public async getById(id: string): Promise<Persona | null> {
        logger.info(`[PersonaService] Intentando obtener persona por ID: ${id}`);
        try {
            const persona = await this.personaRepository.getById(id);

            if (!persona) {
                logger.warn(`[PersonaService] Persona no encontrada para el ID: ${id}`);
                return null;
            }

            let autosAsociados: Auto[] = [];

            try {
                const autos = await this.autoRepository.getByPersonaId(persona.id);
                autosAsociados = autos;
                logger.debug(`[PersonaService] Se encontraron ${autosAsociados.length} autos asociados para la persona ID: ${persona.id}`);

            } catch (error: any) {
                logger.error(`[PersonaService] Error al obtener autos para persona ID ${persona.id}: ${error.message}`, { stack: error.stack });
                autosAsociados = [];
            }

            const personaFinal: Persona = {
                ...persona,
                autos: autosAsociados
            };

            logger.info(`[PersonaService] Persona ID ${id} recuperada con éxito, incluyendo sus autos asociados.`);
            return personaFinal;
        } catch (error: any) {
            logger.error(`[PersonaService] Error en getById para ID ${id}: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    public async create(personaData: Omit<Persona, 'id'>): Promise<Persona> {
        logger.info("[PersonaService] Iniciando la creación de una nueva persona.");
        if (!personaData.nombre || !personaData.dni) {
            logger.warn("[PersonaService] Intento de creación de persona sin campos obligatorios (nombre o DNI).");
            throw new Error('Nombre y DNI son campos obligatorios');
        }

        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            logger.warn(`[PersonaService] Intento de creación de persona con formato de DNI inválido: ${personaData.dni}`);
            throw new Error('Formato de DNI inválido');
        }

        const dataToCreate: Omit<Persona, 'id'> = { ...personaData };

        if ('fechaDeNacimiento' in dataToCreate && typeof (dataToCreate as any).fechaDeNacimiento === 'string' && !isNaN(new Date((dataToCreate as any).fechaDeNacimiento).getTime())) {
            const dateStr = (dataToCreate as any).fechaDeNacimiento;
            try {
                dataToCreate.fechaDeNacimiento = Temporal.PlainDate.from(dateStr);
                logger.debug("[PersonaService] Conversión de fecha (CREATE) aplicada. Fecha después de la conversión:", dataToCreate.fechaDeNacimiento.toString());
            } catch (e) {
                logger.warn(`[PersonaService] Falló la conversión de fecha a Temporal.PlainDate (CREATE) para: ${dateStr}. Error: ${e}`);
                dataToCreate.fechaDeNacimiento = undefined;
            }
        } else {
            logger.debug("[PersonaService] Conversión de fecha (CREATE) NO aplicada. Tipo o valor inesperado para fechaDeNacimiento:", typeof (dataToCreate as any).fechaDeNacimiento, (dataToCreate as any).fechaDeNacimiento);
        }

        try {
            const createdPersona = await this.personaRepository.create(dataToCreate);

            const personaWithEmptyAutos: Persona = {
                ...createdPersona,
                autos: []
            };
            logger.info(`[PersonaService] Persona creada con éxito. ID: ${personaWithEmptyAutos.id}`);
            return personaWithEmptyAutos;
        } catch (error: any) {
            logger.error(`[PersonaService] Error al crear persona: ${error.message}`, { stack: error.stack, personaData: personaData });
            throw error;
        }
    }

    public async update(id: string, personaData: Partial<Persona>): Promise<Persona | null> {
        logger.info(`[PersonaService] Iniciando la actualización para la persona con ID: ${id}`);
        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            logger.warn(`[PersonaService] Intento de actualización de persona con ID ${id} con formato de DNI inválido: ${personaData.dni}`);
            throw new Error('Formato de DNI inválido');
        }

        const dataToUpdate: Partial<Persona> = { ...personaData };

        if ('fechaDeNacimiento' in dataToUpdate && typeof (dataToUpdate as any).fechaDeNacimiento === 'string' && !isNaN(new Date((dataToUpdate as any).fechaDeNacimiento).getTime())) {
            const dateStr = (dataToUpdate as any).fechaDeNacimiento;
            try {
                dataToUpdate.fechaDeNacimiento = Temporal.PlainDate.from(dateStr);
                logger.debug("[PersonaService] Conversión de fecha (UPDATE) aplicada. Fecha después de la conversión:", dataToUpdate.fechaDeNacimiento.toString());
            } catch (e) {
                logger.warn(`[PersonaService] Falló la conversión de fecha a Temporal.PlainDate (UPDATE) para: ${dateStr}. Error: ${e}`);
                dataToUpdate.fechaDeNacimiento = undefined;
            }
        } else {
            logger.debug("[PersonaService] Conversión de fecha (UPDATE) NO aplicada. Tipo o valor inesperado para fechaDeNacimiento:", typeof (dataToUpdate as any).fechaDeNacimiento, (dataToUpdate as any).fechaDeNacimiento);
        }

        try {
            logger.debug(`[PersonaService] Intentando actualizar Persona con ID: ${id}. Datos enviados: ${JSON.stringify(dataToUpdate)}`);
            const updatedPersona = await this.personaRepository.update(id, dataToUpdate);

            if (!updatedPersona) {
                logger.warn(`[PersonaService] El repositorio no pudo actualizar/encontrar la Persona con ID: ${id}.`);
                return null;
            }

            logger.info(`[PersonaService] El repositorio actualizó la Persona con éxito. ID: ${updatedPersona.id}`);

            let autosAsociados: Auto[] = [];
            try {
                autosAsociados = await this.autoRepository.getByPersonaId(updatedPersona.id);
                logger.debug(`[PersonaService] Se encontraron ${autosAsociados.length} autos asociados durante la actualización para la persona ID: ${updatedPersona.id}`);
            } catch (error: any) {
                logger.error(`[PersonaService] Error al obtener autos para persona ID ${updatedPersona.id} durante la actualización: ${error.message}`, { stack: error.stack });
                autosAsociados = [];
            }

            const updatedPersonaWithAutos: Persona = {
                ...updatedPersona,
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
            logger.debug(`[PersonaService] Buscando autos asociados a la persona ID: ${id} para eliminación en cascada.`);
            const autosToDelete = await this.autoRepository.getByPersonaId(id);

            if (autosToDelete.length > 0) {
                logger.info(`[PersonaService] Encontrados ${autosToDelete.length} autos para eliminar en cascada para persona ID: ${id}.`);
                const deletePromises = autosToDelete.map(auto => this.autoRepository.delete(auto.id));
                const results = await Promise.allSettled(deletePromises);

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value) {
                        logger.debug(`[PersonaService] Auto ID ${autosToDelete[index].id} eliminado con éxito.`);
                    } else {
                        logger.warn(`[PersonaService] Falló la eliminación del auto ID ${autosToDelete[index].id} para persona ID ${id}. Razón: ${result.status === 'rejected' ? result.reason.message : 'No eliminado'}`);
                    }
                });
            } else {
                logger.info(`[PersonaService] No se encontraron autos asociados para la persona ID: ${id}.`);
            }

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
        donanteOrganos: boolean;
    }[]> {
        logger.info("[PersonaService] Obteniendo lista resumida de personas.");
        try {
            const personas = await this.personaRepository.getAll();
            const resumidas = personas.map(p => ({
                id: p.id,
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