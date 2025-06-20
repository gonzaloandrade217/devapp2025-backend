import { Db, ObjectId } from 'mongodb'; 
import { AutoService } from '../services/auto.service';
import { PersonaService } from '../services/persona.service';
import { AutoMongoRepository } from '../repositories/mongo/auto.repository';
import { PersonaMongoRepository } from '../repositories/mongo/persona.repository';
import { AutoTransientRepository } from '../repositories/transient/auto.repository';
import { PersonaTransientRepository } from '../repositories/transient/persona.repository';
import { AutoController } from '../controllers/auto.controller';
import { PersonaController } from '../controllers/persona.controller';
import { IAutoRepository } from '../repositories/IAutoRepository';
import { IRepository } from '../repositories/IRepository'; 
import { Persona } from '../models/persona'; 

export class ServiceFactory {
    private static _dbInstance: Db | undefined;
    private static _autoServiceInstance: AutoService | undefined;
    private static _personaServiceInstance: PersonaService | undefined;
    private static _autoControllerInstance: AutoController | undefined;
    private static _personaControllerInstance: PersonaController | undefined;

    public static initialize(db?: Db): void {
        ServiceFactory._dbInstance = db;
    }

    private static getDb(): Db {
        if (!ServiceFactory._dbInstance) {
            throw new Error('ServiceFactory no ha sido inicializado con una instancia de Db para el tipo de base de datos actual.');
        }
        return ServiceFactory._dbInstance;
    }

    public static autoService(): AutoService {
        if (!ServiceFactory._autoServiceInstance) {
            let autoRepo: IAutoRepository<string> | IAutoRepository<ObjectId>;
            let personaRepo: IRepository<Persona, string> | IRepository<Persona, ObjectId>; 

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

    public static personaService(): PersonaService {
        if (!ServiceFactory._personaServiceInstance) {
            let personaRepo: IRepository<Persona, string> | IRepository<Persona, ObjectId>; 
            let autoRepo: IAutoRepository<string> | IAutoRepository<ObjectId>; 

            if (process.env.DB_TYPE === 'transient') {
                personaRepo = new PersonaTransientRepository();
                autoRepo = new AutoTransientRepository(); 
            } else {
                const db = ServiceFactory.getDb();
                personaRepo = new PersonaMongoRepository(db);
                autoRepo = new AutoMongoRepository(db); 
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