import { IRepository } from '../IRepository';

export abstract class AbstractTransientRepository<T extends { id?: string }> implements IRepository<T, string> {
    protected collection: T[];

    constructor(initialData: T[] = []) { 
        this.collection = initialData;
    }

    public async getAll(): Promise<T[]> { 
        return Promise.resolve(this.collection);
    }

    public async getById(id: string): Promise<T | null> { 
        const found = this.collection.find(item => item.id === id);
        return Promise.resolve(found || null);
    }

    public async create(entity: Omit<T, 'id'>): Promise<T> { 
        const newId = (Math.random() * 1000000000).toFixed(0).toString();
        const newEntity: T = {
            ...entity,
            id: newId 
        } as T; 

        this.collection.push(newEntity);
        return Promise.resolve(newEntity);
    }

    public async update(id: string, entity: Partial<T>): Promise<T | null> { 
        let updatedEntity: T | null = null;
        this.collection = this.collection.map(item => {
            if (item.id === id) { 
                updatedEntity = { ...item, ...entity } as T;
                return updatedEntity;
            }
            return item;
        });
        return Promise.resolve(updatedEntity);
    }

    public async delete(id: string): Promise<boolean> {
        const initialLength = this.collection.length;
        this.collection = this.collection.filter(item => item.id !== id); 
        return Promise.resolve(this.collection.length < initialLength);
    }
}