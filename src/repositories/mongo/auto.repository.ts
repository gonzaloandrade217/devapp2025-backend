import { Db, ObjectId, WithId } from 'mongodb';
import { AbstractMongoRepository } from './abstract.repository'; 
import { Auto } from '../../models/auto'; 

export class AutoMongoRepository extends AbstractMongoRepository<Auto> {
    protected collectionName = 'autos';

    constructor(db: Db) {
        super(db);
    }

    async getByPatente(patente: string): Promise<WithId<Auto> | null> {
        try {
            return await this.getCollection().findOne({ patente: patente }) as WithId<Auto> | null;
        } catch (error) {
            console.error(`Error al obtener auto por patente ${patente}:`, error);
            return null;
        }
    }

    async getByPersonaId(personaId: string): Promise<WithId<Auto>[]> {
        try {
            return await this.getCollection().find({ personaId: personaId }).toArray() as unknown as WithId<Auto>[];
        } catch (error) {
            console.error(`Error al obtener autos por persona ID ${personaId}:`, error);
            return [];
        }
    }
}