import { Db } from 'mongodb';
import { Firestore } from 'firebase/firestore';
import { AutoService } from '../services/auto.service';
import { PersonaService } from '../services/persona.service';
import { AutoMongoRepository } from '../repositories/mongo/auto.repository';
import { PersonaMongoRepository } from '../repositories/mongo/persona.repository';
import { AutoTransientRepository } from '../repositories/transient/auto.repository';
import { PersonaTransientRepository } from '../repositories/transient/persona.repository';
import { AutoFirebaseRepository } from '../repositories/firebase/auto.repository';
import { PersonaFirebaseRepository } from '../repositories/firebase/persona.repository';
import { AutoController } from '../controllers/auto.controller';
import { PersonaController } from '../controllers/persona.controller';
import { IAutoRepository } from '../repositories/IAutoRepository';
import { IRepository } from '../repositories/IRepository';
import { Persona } from '../models/persona';

type DatabaseInstance = Db | Firestore | undefined;

export class ServiceFactory {
    private static _dbInstance: DatabaseInstance;
    private static _autoServiceInstance: AutoService | undefined;
    private static _personaServiceInstance: PersonaService | undefined;
    private static _autoControllerInstance: AutoController | undefined;
    private static _personaControllerInstance: PersonaController | undefined;

    public static initialize(dbInstance: DatabaseInstance): void {
        ServiceFactory._dbInstance = dbInstance;
    }

    private static getDbInstance(): DatabaseInstance {
        if (ServiceFactory._dbInstance === undefined && process.env.DB_TYPE !== 'transient') {
            throw new Error('ServiceFactory no ha sido inicializado con una instancia de DB para el tipo de base de datos actual.');
        }
        return ServiceFactory._dbInstance;
    }

    public static autoService(): AutoService {
        if (!ServiceFactory._autoServiceInstance) {
            let autoRepo: IAutoRepository<any>;
            let personaRepo: IRepository<Persona, any>;

            const dbInstance = ServiceFactory.getDbInstance();

            if (process.env.DB_TYPE === 'transient') {
                autoRepo = new AutoTransientRepository();
                personaRepo = new PersonaTransientRepository();
            } else if (process.env.DB_TYPE === 'firebase') {
                if (!(dbInstance instanceof Firestore)) {
                    throw new Error('La instancia de DB no es de Firestore para el tipo "firebase".');
                }
                autoRepo = new AutoFirebaseRepository(dbInstance);
                personaRepo = new PersonaFirebaseRepository(dbInstance);
            } else if (process.env.DB_TYPE === 'mongodb') {
                if (!(dbInstance instanceof Db)) {
                    throw new Error('La instancia de DB no es de MongoDB para el tipo "mongodb".');
                }
                autoRepo = new AutoMongoRepository(dbInstance);
                personaRepo = new PersonaMongoRepository(dbInstance);
            } else {
                throw new Error('Tipo de base de datos no configurado o reconocido en DB_TYPE.');
            }
            ServiceFactory._autoServiceInstance = new AutoService(autoRepo, personaRepo);
        }
        return ServiceFactory._autoServiceInstance;
    }

    public static personaService(): PersonaService {
        if (!ServiceFactory._personaServiceInstance) {
            let personaRepo: IRepository<Persona, any>;
            let autoRepo: IAutoRepository<any>;

            const dbInstance = ServiceFactory.getDbInstance();

            if (process.env.DB_TYPE === 'transient') {
                personaRepo = new PersonaTransientRepository();
                autoRepo = new AutoTransientRepository();
            } else if (process.env.DB_TYPE === 'firebase') {
                if (!(dbInstance instanceof Firestore)) {
                    throw new Error('La instancia de DB no es de Firestore para el tipo "firebase".');
                }
                personaRepo = new PersonaFirebaseRepository(dbInstance);
                autoRepo = new AutoFirebaseRepository(dbInstance);
            } else if (process.env.DB_TYPE === 'mongodb') {
                if (!(dbInstance instanceof Db)) {
                    throw new Error('La instancia de DB no es de MongoDB para el tipo "mongodb".');
                }
                personaRepo = new PersonaMongoRepository(dbInstance);
                autoRepo = new AutoMongoRepository(dbInstance);
            } else {
                throw new Error('Tipo de base de datos no configurado o reconocido en DB_TYPE.');
            }

            ServiceFactory._personaServiceInstance = new PersonaService(personaRepo, autoRepo);
        }
        return ServiceFactory._personaServiceInstance;
    }

    public static getAutoController(): AutoController {
        if (!ServiceFactory._autoControllerInstance) {
            ServiceFactory._autoControllerInstance = new AutoController(ServiceFactory.autoService());
        }
        return ServiceFactory._autoControllerInstance;
    }

    public static getPersonaController(): PersonaController {
        if (!ServiceFactory._personaControllerInstance) {
            ServiceFactory._personaControllerInstance = new PersonaController(ServiceFactory.personaService());
        }
        return ServiceFactory._personaControllerInstance;
    }
}