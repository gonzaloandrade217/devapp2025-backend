import { Db, WithId } from 'mongodb'; 
import { AbstractMongoRepository } from './abstract.repository'; 
import { Auto } from '../../models/auto'; 

export class AutoMongoRepository extends AbstractMongoRepository<Auto> {
    protected collectionName = 'autos';

    constructor(db: Db) {
        super(db);
    }

    async getByPatente(patente: string): Promise<WithId<Auto> | null> {
        try {
            const result = await this.getCollectionInstance().findOne({ patente: patente });
            return result as WithId<Auto> | null; 
        } catch (error) {
            console.error(`Error al obtener auto por patente ${patente}:`, error);
            return null;
        }
    }

    async getByPersonaId(personaId: string): Promise<WithId<Auto>[]> {
        try {
            const result = await this.getCollectionInstance().find({ personaID: personaId }).toArray();
            return result as WithId<Auto>[]; 
        } catch (error) {
            console.error(`Error al obtener autos por persona ID ${personaId}:`, error);
            return [];
        }
    }
}