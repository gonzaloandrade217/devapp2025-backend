import { ObjectId, Db, WithId, Document, Collection, Filter, UpdateFilter, OptionalUnlessRequiredId } from 'mongodb'; 
import { IRepository } from '../IRepository';

export abstract class AbstractMongoRepository<TEntity> implements IRepository<TEntity> {
    protected abstract collectionName: string;
    protected db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    protected getCollectionInstance(): Collection<Document> { 
        return this.db.collection<Document>(this.collectionName); 
    }

    public async getAll(): Promise<WithId<TEntity>[]> {
        try {
            const documents = await this.getCollectionInstance().find().toArray();
            return documents as WithId<TEntity>[]; 
        } catch (error) {
            console.error('Error al obtener todos los documentos:', error);
            throw error;
        }
    }

    public async getById(id: string): Promise<WithId<TEntity> | null> {
        try {
            const objectId = new ObjectId(id);
            const result = await this.getCollectionInstance().findOne({ _id: objectId });
            return result as WithId<TEntity> | null; 
        } catch (error) {
            console.error(`Error al obtener el documento con ID ${id}:`, error);
            return null;
        }
    }

    public async update(id: string, entity: Partial<TEntity>): Promise<WithId<TEntity> | null> {
        try {
            const objectId = new ObjectId(id);
            const filter: Filter<Document> = { _id: new ObjectId(id) }; 
            const updateDoc: UpdateFilter<Document> = { $set: entity as Document }; 

            console.log("REPOSITORY DEBUG: ***** INICIANDO DEPURACIÓN DE UPDATE *****");
            console.log("REPOSITORY DEBUG: Intentando findOneAndUpdate con ID:", objectId.toHexString()); 
            console.log("REPOSITORY DEBUG: Query de busqueda:", JSON.stringify(filter, null, 2)); 
            console.log("REPOSITORY DEBUG: Datos que se enviarán en $set:", JSON.stringify(entity, null, 2)); 

            const result = await this.getCollectionInstance().findOneAndUpdate(
                filter, 
                updateDoc, 
                { returnDocument: 'after' } 
            );

            if (result) {
                console.log("REPOSITORY DEBUG: Documento ENCONTRADO y ACTUALIZADO.");
                console.log("REPOSITORY DEBUG: ID del documento actualizado:", result._id);
                console.log("REPOSITORY DEBUG: Documento COMPLETO después de actualización:", JSON.stringify(result, null, 2));
                console.log("REPOSITORY DEBUG: ***** FIN DEPURACIÓN DE UPDATE (ÉXITO) *****");
                return result as WithId<TEntity>; 
            } else {
                console.log("REPOSITORY DEBUG: Documento NO ENCONTRADO para el ID:", objectId.toHexString()); // También cambiar aquí
                console.log("REPOSITORY DEBUG: Resultado de findOneAndUpdate:", result); 
                if (result && result === null) {
                    console.log("REPOSITORY DEBUG: findOneAndUpdate encontró el documento pero devolvió null (posiblemente no hubo cambios o un error interno en la operación del driver/DB).");
                }
                console.log("REPOSITORY DEBUG: ***** FIN DEPURACIÓN DE UPDATE (FALLO) *****");
                return null; 
            }

        } catch (error: any) {
            console.error(`REPOSITORY DEBUG: ERROR FATAL durante la actualización para ID ${id}:`, error.message, error.stack);
            console.log("REPOSITORY DEBUG: ***** FIN DEPURACIÓN DE UPDATE (ERROR FATAL) *****");
            return null; 
        }
    }

    public async create(entity: Omit<TEntity, '_id' | 'id'>): Promise<WithId<TEntity>> {
        try {
            const documentToInsert: Document = { ...entity, _id: new ObjectId() }; 
            const result = await this.getCollectionInstance().insertOne(documentToInsert); 
            return { _id: result.insertedId, ...entity } as WithId<TEntity>; 
        } catch (error) {
            console.error('Error al crear un nuevo documento:', error);
            throw error;
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(id);
            const filter: Filter<Document> = { _id: objectId };
            const result = await this.getCollectionInstance().deleteOne(filter);
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error al eliminar el documento con ID ${id}:`, error);
            return false;
        }
    }
}