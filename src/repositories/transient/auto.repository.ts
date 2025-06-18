import { Auto } from '../../models/auto';
import { AbstractTransientRepository } from './abstract.repository';
import { db } from './db';

export class AutoTransientRepository extends AbstractTransientRepository<Auto> {
    constructor() {
        super(db.autos); 
    }
    async getAutosByPersonaId(personaId: string): Promise<Auto[]> {
        return db.all(this.collection).filter(auto => auto.personaID === personaId);
    }
}