import { ObjectId, Db, Document, Collection, Filter, UpdateFilter, OptionalUnlessRequiredId } from 'mongodb'; 
import { IRepository } from '../IRepository'; 
import logger from '../../config/logger'; 

export abstract class AbstractMongoRepository<TEntity> implements IRepository<TEntity, ObjectId> {
    protected abstract collectionName: string;
    protected db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    protected getCollectionInstance(): Collection<Document> { 
        return this.db.collection<Document>(this.collectionName); 
    }

    public async getAll(): Promise<(TEntity & { _id: ObjectId })[]> { 
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando obtener todos los documentos.`);
            const documents = await this.getCollectionInstance().find().toArray();
            logger.info(`[${this.collectionName}Repository] Se obtuvieron ${documents.length} documentos.`);
            return documents as (TEntity & { _id: ObjectId })[]; 
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener todos los documentos: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            throw error; 
        }
    }

    public async getById(id: string): Promise<(TEntity & { _id: ObjectId }) | null> { 
        try {
            const objectId = new ObjectId(id);
            logger.debug(`[${this.collectionName}Repository] Intentando obtener documento por ID: ${id}`);
            const result = await this.getCollectionInstance().findOne({ _id: objectId });
            if (result) {
                logger.info(`[${this.collectionName}Repository] Documento encontrado con ID: ${id}`);
            } else {
                logger.warn(`[${this.collectionName}Repository] Documento no encontrado con ID: ${id}`);
            }
            return result as (TEntity & { _id: ObjectId }) | null; 
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener el documento con ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                invalidId: id
            });
            return null; 
        }
    }

    public async update(id: string, entity: Partial<TEntity>): Promise<(TEntity & { _id: ObjectId }) | null> { 
        try {
            const objectId = new ObjectId(id);
            const filter: Filter<Document> = { _id: new ObjectId(id) }; 
            const updateDoc: UpdateFilter<Document> = { $set: entity as Document }; 

            logger.debug(`[${this.collectionName}Repository] INICIANDO DEPURACIÓN DE UPDATE`);
            logger.debug(`[${this.collectionName}Repository] Intentando findOneAndUpdate con ID: ${objectId.toHexString()}`); 
            logger.debug(`[${this.collectionName}Repository] Query de búsqueda: ${JSON.stringify(filter)}`); 
            logger.debug(`[${this.collectionName}Repository] Datos que se enviarán en $set: ${JSON.stringify(entity)}`); 

            const result = await this.getCollectionInstance().findOneAndUpdate(
                filter, 
                updateDoc, 
                { returnDocument: 'after' } 
            );

            if (result) {
                logger.info(`[${this.collectionName}Repository] Documento ENCONTRADO y ACTUALIZADO. ID: ${result._id}`);
                logger.debug(`[${this.collectionName}Repository] Documento COMPLETO después de actualización: ${JSON.stringify(result)}`);
                logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (ÉXITO)`);
                return result as (TEntity & { _id: ObjectId }); 
            } else {
                logger.warn(`[${this.collectionName}Repository] Documento NO ENCONTRADO para el ID: ${objectId.toHexString()}. No se realizó actualización.`);
                logger.debug(`[${this.collectionName}Repository] Resultado de findOneAndUpdate: ${JSON.stringify(result)}`); 
                logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (FALLO)`);
                return null; 
            }

        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] ERROR FATAL durante la actualización para ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                entityId: id,
                updateData: entity
            });
            logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (ERROR FATAL)`);
            throw error; 
        }
    }

    public async create(entity: Omit<TEntity, '_id' | 'id'>): Promise<(TEntity & { _id: ObjectId })> { 
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando crear nuevo documento.`);
            const documentToInsert: OptionalUnlessRequiredId<Document> = { ...entity } as OptionalUnlessRequiredId<Document>;
            const result = await this.getCollectionInstance().insertOne(documentToInsert); 
            
            logger.info(`[${this.collectionName}Repository] Documento creado con éxito. ID: ${result.insertedId}`);
            return { _id: result.insertedId, ...entity } as (TEntity & { _id: ObjectId }); 
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al crear un nuevo documento: ${error.message}`, {
                error: error,
                stack: error.stack,
                entityData: entity
            });
            throw error; 
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(id);
            logger.debug(`[${this.collectionName}Repository] Intentando eliminar documento con ID: ${id}`);
            const filter: Filter<Document> = { _id: objectId };
            const result = await this.getCollectionInstance().deleteOne(filter);
            if (result.deletedCount > 0) {
                logger.info(`[${this.collectionName}Repository] Documento eliminado con éxito. ID: ${id}`);
            } else {
                logger.warn(`[${this.collectionName}Repository] Documento no encontrado para eliminar con ID: ${id}.`);
            }
            return result.deletedCount > 0;
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al eliminar el documento con ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                deleteId: id
            });
            throw error; 
        }
    }
}