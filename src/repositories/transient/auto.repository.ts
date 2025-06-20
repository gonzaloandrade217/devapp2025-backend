import { Auto } from '../../models/auto';
import { AbstractTransientRepository } from './abstract.repository';
import { db } from './db'; 
import { IAutoRepository } from '../IAutoRepository'; 

export class AutoTransientRepository extends AbstractTransientRepository<Auto> implements IAutoRepository<string> { // Aquí usamos 'string'
    constructor() {
        super(Object.values(db.autos) as (Auto & { _id: string })[]); 
    }

    public async getByPersonaId(personaId: string): Promise<(Auto & { _id: string })[]> {
        const filteredAutos = this.collection.filter(auto => auto.personaID === personaId);
        return filteredAutos as (Auto & { _id: string })[];
    }

    public async getByPatente(patente: string): Promise<(Auto & { _id: string }) | null> {
        const foundAuto = this.collection.find(auto => auto.patente === patente);
        return foundAuto ? (foundAuto as Auto & { _id: string }) : null;
    }
}