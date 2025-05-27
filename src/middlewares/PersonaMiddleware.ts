// src/middlewares/PersonaMiddleware.ts
import { fromPersonaToListingDTO, PersonaListingDTO } from '../DTO/persona.dto';
import { validatedPersona, Persona, ValidatedPersonaInput } from '../models/persona'; 
import { IService, ServiceFactory } from '../services';
import { BREADMiddleware } from './BREADMiddleware';
import { identity } from '../helpers';

// Pasa ValidatedPersonaInput como el cuarto tipo genérico
export class PersonaMiddleware extends BREADMiddleware<Persona, PersonaListingDTO, Persona, ValidatedPersonaInput> {
    protected service: IService<Persona> = ServiceFactory.personaService();
    protected entityToListingEntity = fromPersonaToListingDTO;
    protected entityToFullEntity = identity;
    protected validatedEntity = validatedPersona; // Ahora esto debería ser compatible
}