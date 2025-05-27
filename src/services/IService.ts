import { WithId } from 'mongodb'; 
export interface IService<T> {
    getAll(): Promise<WithId<T>[]>;
    getById(id: string): Promise<WithId<T> | null>;
    create(data: Omit<T, '_id' | 'id'>): Promise<WithId<T>>;
    update(id: string, data: Partial<T>): Promise<WithId<T> | null>;
    delete(id: string): Promise<boolean>;
}