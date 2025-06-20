import { IRepository } from '../IRepository';

export abstract class AbstractTransientRepository<T extends { id?: string }> implements IRepository<T, string> {
    protected collection: (T & { _id: string })[];

    constructor(initialData: (T & { _id: string })[] = []) {
        this.collection = initialData;
    }

    public async getAll(): Promise<(T & { _id: string })[]> {
        return Promise.resolve(this.collection);
    }

    public async getById(id: string): Promise<(T & { _id: string }) | null> {
        const found = this.collection.find(item => item._id === id);
        return Promise.resolve(found || null);
    }

    public async create(entity: Omit<T, '_id' | 'id'>): Promise<T & { _id: string }> {
        const newId = (Math.random() * 1000000000).toFixed(0).toString(); 
        const newEntity: T & { _id: string } = { 
            _id: newId, 
            ...entity,
            id: newId 
        } as T & { _id: string };
        this.collection.push(newEntity);
        return Promise.resolve(newEntity);
    }

    public async update(id: string, entity: Partial<T>): Promise<(T & { _id: string }) | null> {
        let updatedEntity: (T & { _id: string }) | null = null;
        this.collection = this.collection.map(item => {
            if (item._id === id) { 
                updatedEntity = { ...item, ...entity } as T & { _id: string };
                return updatedEntity;
            }
            return item;
        });
        return Promise.resolve(updatedEntity);
    }

    public async delete(id: string): Promise<boolean> {
        const initialLength = this.collection.length;
        this.collection = this.collection.filter(item => item._id !== id); 
        return Promise.resolve(this.collection.length < initialLength);
    }
}