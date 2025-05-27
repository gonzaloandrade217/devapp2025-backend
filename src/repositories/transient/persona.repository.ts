import { Persona } from '../../models/persona';
import { AbstractTransientRepository } from './abstract.repository';
import { db } from './db';

export class PersonaTransientRepository extends AbstractTransientRepository<Persona> {
    constructor() {
        super(db.personas); 
    }
}