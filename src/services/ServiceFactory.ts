import { Db } from 'mongodb';
import { AutoService } from './auto.service';
import { PersonaService } from './persona.service';
import { Auto } from '../models/auto';
import { Persona } from '../models/persona';
import { IService } from './IService';

import { AutoMongoRepository } from '../repositories/mongo/auto.repository';
import { PersonaMongoRepository } from '../repositories/mongo/persona.repository';

import { AutoTransientRepository } from '../repositories/transient/auto.repository';
import { PersonaTransientRepository } from '../repositories/transient/persona.repository';

type AutoRepoType = AutoMongoRepository | AutoTransientRepository;
type PersonaRepoType = PersonaMongoRepository | PersonaTransientRepository;


export class ServiceFactory {
    private static _dbInstance: Db | undefined;
    private static _autoServiceInstance: AutoService | undefined;
    private static _personaServiceInstance: PersonaService | undefined;

    public static initialize(db?: Db): void {
        ServiceFactory._dbInstance = db;
    }

    private static getDb(): Db {
        if (!ServiceFactory._dbInstance) {
            throw new Error('ServiceFactory no ha sido inicializado con una instancia de Db para el tipo de base de datos actual.');
        }
        return ServiceFactory._dbInstance;
    }

    public static autoService(): IService<Auto> {
        if (!ServiceFactory._autoServiceInstance) {
            let autoRepo;
            let personaRepo;

            if (process.env.DB_TYPE === 'transient') {
                autoRepo = new AutoTransientRepository();
                personaRepo = new PersonaTransientRepository();
            } else {
                const db = ServiceFactory.getDb();
                autoRepo = new AutoMongoRepository(db);
                personaRepo = new PersonaMongoRepository(db);
            }
            ServiceFactory._autoServiceInstance = new AutoService(autoRepo, personaRepo);
        }
        return ServiceFactory._autoServiceInstance;
    }

    public static personaService(): IService<Persona> {
        if (!ServiceFactory._personaServiceInstance) {
            let personaRepo; 

            if (process.env.DB_TYPE === 'transient') {
                personaRepo = new PersonaTransientRepository();
            } else {
                const db = ServiceFactory.getDb();
                personaRepo = new PersonaMongoRepository(db);
            }
            ServiceFactory._personaServiceInstance = new PersonaService(personaRepo);
        }
        return ServiceFactory._personaServiceInstance;
    }
}