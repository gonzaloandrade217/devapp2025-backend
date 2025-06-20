import { WithId, ObjectId } from "mongodb";
import { Auto } from "../models/auto";
import { Persona } from "../models/persona"; 
import { IService } from "./IService"; 
import { IAutoRepository } from '../repositories/IAutoRepository';
import { IRepository } from "../repositories/IRepository"; 
import logger from "../config/logger";

export class AutoService implements IService<Auto, string | ObjectId> { 
    private autoRepository: IAutoRepository<string> | IAutoRepository<ObjectId>;
    private personaRepository: IRepository<Persona, string> | IRepository<Persona, ObjectId>; 

    constructor(
        autoRepository: IAutoRepository<string> | IAutoRepository<ObjectId>,
        personaRepository: IRepository<Persona, string> | IRepository<Persona, ObjectId>
    ) {
        this.autoRepository = autoRepository;
        this.personaRepository = personaRepository;
        logger.info("[AutoService] Instancia creada.");
    }

    public async getAll(): Promise<(Auto & { _id: string | ObjectId })[]> {
        logger.info("[AutoService] Intentando obtener todos los autos.");
        try {
            const autos = await this.autoRepository.getAll();
            logger.debug(`[AutoService] Se encontraron ${autos.length} autos.`);
            return autos;
        } catch (error: any) {
            logger.error(`[AutoService] Error al obtener todos los autos: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    public async getById(id: string): Promise<(Auto & { _id: string | ObjectId }) | null> {
        logger.info(`[AutoService] Intentando obtener auto por ID: ${id}`);
        try {
            const autoDoc = await this.autoRepository.getById(id);
            if (!autoDoc) {
                logger.warn(`[AutoService] Auto no encontrado para el ID: ${id}`);
                return null;
            }
            logger.info(`[AutoService] Auto encontrado con ID: ${id}`);
            return autoDoc;
        } catch (error: any) {
            logger.error(`[AutoService] Error al obtener auto por ID ${id}: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    public async create(autoData: Omit<Auto, '_id' | 'id'>): Promise<(Auto & { _id: string | ObjectId })> {
        logger.info("[AutoService] Iniciando la creación de un nuevo auto.");
        if (!autoData.patente || !autoData.marca || !autoData.modelo) {
            logger.warn("[AutoService] Intento de creación de auto sin campos obligatorios (patente, marca o modelo).");
            throw new Error('Patente, marca y modelo son campos obligatorios');
        }

        try {
            const createdAuto = await this.autoRepository.create(autoData);
            const createdAutoIdString = typeof createdAuto._id === 'string' ? createdAuto._id : createdAuto._id.toHexString();
            logger.info(`[AutoService] Auto creado con éxito. ID: ${createdAutoIdString}`);
            return createdAuto;
        } catch (error: any) {
            logger.error(`[AutoService] Error al crear auto: ${error.message}`, { stack: error.stack, autoData: autoData });
            throw error;
        }
    }

    public async update(id: string, autoData: Partial<Auto>): Promise<(Auto & { _id: string | ObjectId }) | null> {
        logger.info(`[AutoService] Iniciando la actualización para el auto con ID: ${id}`);
        try {
            const updated = await this.autoRepository.update(id, autoData);
            if (!updated) {
                logger.warn(`[AutoService] El repositorio no pudo actualizar/encontrar el Auto con ID: ${id}.`);
                return null;
            }
            const updatedAutoIdString = typeof updated._id === 'string' ? updated._id : updated._id.toHexString();
            logger.info(`[AutoService] El repositorio actualizó el Auto con éxito. ID: ${updatedAutoIdString}`);
            return updated;
        } catch (error: any) {
            logger.error(`[AutoService] Error al actualizar auto ID ${id}: ${error.message}`, { stack: error.stack, updateData: autoData });
            throw error;
        }
    }

    public async delete(id: string): Promise<boolean> {
        logger.info(`[AutoService] Iniciando la eliminación del auto con ID: ${id}`);
        try {
            const deleted = await this.autoRepository.delete(id);
            if (deleted) {
                logger.info(`[AutoService] Auto ID ${id} eliminado con éxito.`);
            } else {
                logger.warn(`[AutoService] Auto ID ${id} no encontrado para eliminar.`);
            }
            return deleted;
        } catch (error: any) {
            logger.error(`[AutoService] Error al eliminar auto ID ${id}: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    public async getByPatente(patente: string): Promise<(Auto & { _id: string | ObjectId }) | null> {
        logger.info(`[AutoService] Intentando obtener auto por patente: ${patente}`);
        try {
            const result = await this.autoRepository.getByPatente(patente);
            if (result) {
                logger.info(`[AutoService] Auto encontrado con patente: ${patente}`);
            } else {
                logger.warn(`[AutoService] Auto no encontrado con patente: ${patente}`);
            }
            return result;
        } catch (error: any) {
            logger.error(`[AutoService] Error al obtener auto por patente ${patente}: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    public async getByPersonaId(personaID: string): Promise<(Auto & { _id: string | ObjectId })[]> {
        logger.info(`[AutoService] Intentando obtener autos por ID de persona: ${personaID}`);
        try {
            const autos = await this.autoRepository.getByPersonaId(personaID);
            logger.debug(`[AutoService] Se encontraron ${autos.length} autos para la persona ID: ${personaID}.`);
            return autos;
        } catch (error: any) {
            logger.error(`[AutoService] Error al obtener autos por persona ID ${personaID}: ${error.message}`, { stack: error.stack });
            throw error;
        }
    }

    private validarPatente(patente: string): boolean {
        const isValid = /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(patente) || /^[A-Z]{3}\d{3}$/.test(patente);
        if (!isValid) {
            logger.debug(`[AutoService] Falló la validación de patente para: ${patente}`);
        }
        return isValid;
    }
}