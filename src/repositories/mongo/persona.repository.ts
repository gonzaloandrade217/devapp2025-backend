import { Db } from 'mongodb';
import { AbstractMongoRepository } from './abstract.repository'; 
import { Persona } from '../../models/persona'; 

export class PersonaMongoRepository extends AbstractMongoRepository<Persona> {
    protected collectionName = 'personas';

    constructor(db: Db) {
        super(db);
    }

    async isDniUnique(dni: string, idToIgnore?: string): Promise<boolean> {
        const query: any = { dni: dni };
        if (idToIgnore) {
            query._id = { $ne: idToIgnore };
        }
        const count = await this.getCollection().countDocuments(query);
        return count === 0;
    }

}