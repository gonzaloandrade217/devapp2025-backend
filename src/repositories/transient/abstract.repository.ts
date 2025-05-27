import { UUID } from '../../models/UUID';
import { IRepository } from '../IRepository'; 
import { db } from './db';
import { ObjectId, WithId } from 'mongodb'; 

export abstract class AbstractTransientRepository<T> implements IRepository<T> {
    protected collection: Record<UUID, T & { _id: UUID }>;

    constructor(collection: Record<UUID, T & { _id: UUID }>) {
        this.collection = collection;
    }

    private convertToObjectId(id: UUID): ObjectId {
        try {
            return new ObjectId(id);
        } catch (e) {
            console.warn(`ID "${id}" no es un ObjectId válido para conversión. Generando un nuevo ObjectId.`);
            return new ObjectId(); 
        }
    }

    private mapToWithId(entity: T & { _id: UUID }): WithId<T> {
        return {
            ...entity,
            _id: this.convertToObjectId(entity._id)
        } as WithId<T>;
    }

    async getAll(): Promise<WithId<T>[]> {
        const allEntities = db.all(this.collection);
        return allEntities.map(entity => this.mapToWithId(entity));
    }

    async getById(id: string): Promise<WithId<T> | null> {
        const entity = this.collection[id];
        return entity ? this.mapToWithId(entity) : null;
    }

    async create(data: Omit<T, '_id' | 'id'>): Promise<WithId<T>> {
        const newId = (Object.keys(this.collection).length + 1).toString();
        const newEntityInternal: T & { _id: UUID } = { ...data as T, _id: newId };
        this.collection[newId] = newEntityInternal;
        return this.mapToWithId(newEntityInternal);
    }

    async update(id: string, data: Partial<T>): Promise<WithId<T> | null> {
        if (!this.collection[id]) {
            return null;
        }
        const updatedEntityInternal: T & { _id: UUID } = { ...this.collection[id], ...data };
        this.collection[id] = updatedEntityInternal;
        return this.mapToWithId(updatedEntityInternal);
    }

    async delete(id: string): Promise<boolean> {
        if (!this.collection[id]) {
            return false;
        }
        delete this.collection[id];
        return true;
    }
}