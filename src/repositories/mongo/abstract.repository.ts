import { ObjectId, Db, WithId } from 'mongodb'; 
import { IRepository } from '../IRepository';

export abstract class AbstractMongoRepository<TEntity> implements IRepository<TEntity> {
    protected abstract collectionName: string;
    protected db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    protected getCollection() {
        return this.db.collection(this.collectionName);
    }

    public async getAll(): Promise<WithId<TEntity>[]> {
        try {
            const documents = await this.getCollection().find().toArray();
            return documents as WithId<TEntity>[]; 
        } catch (error) {
            console.error('Error al obtener todos los documentos:', error);
            throw error;
        }
    }

    public async getById(id: string): Promise<WithId<TEntity> | null> {
        try {
            const objectId = new ObjectId(id);
            return await this.getCollection().findOne({ _id: objectId }) as WithId<TEntity> | null;
        } catch (error) {
            console.error(`Error al obtener el documento con ID ${id}:`, error);
            return null;
        }
    }

    public async update(id: string, entity: Partial<TEntity>): Promise<WithId<TEntity> | null> {
        try {
            const objectId = new ObjectId(id);
            const result = await this.getCollection().findOneAndUpdate(
                { _id: objectId },
                { $set: entity },
                { returnDocument: 'after' }
            );
            if (result && result.value) {
                return result.value as WithId<TEntity>; // Ya es WithId<TEntity>
            } else {
                return null;
            }

        } catch (error) {
            console.error(`Error al actualizar el documento con ID ${id}:`, error);
            return null;
        }
    }

     public async create(entity: Omit<TEntity, '_id' | 'id'>): Promise<WithId<TEntity>> {
        try {
            const result = await this.getCollection().insertOne(entity);
            return { _id: result.insertedId, ...entity } as WithId<TEntity>;
        } catch (error) {
            console.error('Error al crear un nuevo documento:', error);
            throw error;
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            const objectId = new ObjectId(id);
            const result = await this.getCollection().deleteOne({ _id: objectId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error(`Error al eliminar el documento con ID ${id}:`, error);
            return false;
        }
    }
}