export interface IService<T, ID_TYPE = string> { 
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(entity: Omit<T, '_id' | 'id'>): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}