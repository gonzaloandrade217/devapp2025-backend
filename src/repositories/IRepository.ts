import { ObjectId } from 'mongodb';

export interface IRepository<T, ID_TYPE = ObjectId> { 
    getAll(): Promise<(T & { _id: ID_TYPE })[]>;
    getById(id: string): Promise<(T & { _id: ID_TYPE }) | null>;
    create(entity: Omit<T, '_id' | 'id'>): Promise<T & { _id: ID_TYPE }>;
    update(id: string, entity: Partial<T>): Promise<(T & { _id: ID_TYPE }) | null>;
    delete(id: string): Promise<boolean>;
}