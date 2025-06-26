import { Db, WithId, Collection, Document, Filter, UpdateFilter, ObjectId } from 'mongodb'; 
import { AbstractMongoRepository } from './abstract.repository'; 
import { Auto } from '../../models/auto'; 
import logger from '../../config/logger';
import { IAutoRepository } from '../IAutoRepository'; 

export class AutoMongoRepository extends AbstractMongoRepository<Auto> implements IAutoRepository<string> {
    protected collectionName: string = 'autos';

    constructor(db: Db) {
        super(db);
        logger.info(`[AutoMongoRepository] Instancia creada para colección: ${this.collectionName}`);
    }

    protected mapToDomain(document: WithId<Document>): Auto {
        const idString = document._id.toHexString();

        return {
            id: idString, 
            patente: document.patente as string,
            marca: document.marca as string,
            modelo: document.modelo as string,
            anio: document.anio as number,
            color: document.color as string,
            nroChasis: document.nroChasis as string,
            nroMotor: document.nroMotor as string,
            personaID: document.personaID as string, 
        } as Auto; 
    }

    protected mapToMongo(entity: Omit<Auto, 'id'> | Partial<Auto>): Document {
        const mongoDocument: Document = {
            patente: entity.patente,
            marca: entity.marca,
            modelo: entity.modelo,
            anio: entity.anio,
            color: entity.color,
            nroChasis: entity.nroChasis,
            nroMotor: entity.nroMotor,
            personaID: entity.personaID,
        };

        Object.keys(mongoDocument).forEach(key => mongoDocument[key] === undefined && delete mongoDocument[key]);

        return mongoDocument;
    }

    async getByPatente(patente: string): Promise<(Auto & { _id: ObjectId }) | null> { 
        try {
            const result = await this.getCollectionInstance().findOne({ patente: patente });
            return result as (Auto & { _id: ObjectId }) | null; 
        } catch (error) {
            logger.error(`[AutoMongoRepository] Error al obtener auto por patente ${patente}:`, error);
            return null;
        }
    }

    async getByPersonaId(personaID: string): Promise<(Auto & { _id: ObjectId })[]> { 
        try {
            logger.debug(`[AutoMongoRepository] Buscando autos para persona ID: ${personaID}`);
            const documents = await this.getCollectionInstance().find({ personaID: personaID }).toArray();
            return documents as (Auto & { _id: ObjectId })[]; 
        } catch (error) {
            logger.error(`[AutoMongoRepository] Error al obtener autos por persona ID ${personaID}:`, error);
            return [];
        }
    }
    
    // Métodos heredados de IRepository<Auto, ObjectId>

    public async getAll(): Promise<(Auto & { _id: ObjectId })[]> {
        return super.getAll() as Promise<(Auto & { _id: ObjectId })[]>;
    }

    public async getById(id: string): Promise<(Auto & { _id: ObjectId }) | null> {
        return super.getById(id) as Promise<(Auto & { _id: ObjectId }) | null>;
    }

    public async create(entity: Omit<Auto, '_id' | 'id'>): Promise<(Auto & { _id: ObjectId })> {
        return super.create(entity) as Promise<(Auto & { _id: ObjectId })>;
    }

    public async update(id: string, entity: Partial<Auto>): Promise<(Auto & { _id: ObjectId }) | null> {
        return super.update(id, entity) as Promise<(Auto & { _id: ObjectId }) | null>;
    }

    public async delete(id: string): Promise<boolean> {
        return super.delete(id);
    }
}