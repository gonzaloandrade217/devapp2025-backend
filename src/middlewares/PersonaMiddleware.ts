import { fromPersonaToListingDTO, PersonaListingDTO } from '../DTO/persona.dto';
import { validatedPersona, Persona, ValidatedPersonaInput } from '../models/persona';
import { IService, ServiceFactory } from '../services';
import { BREADMiddleware } from './BREADMiddleware';
import { identity } from '../helpers';
import { ObjectId } from 'mongodb'; 

export class PersonaMiddleware extends BREADMiddleware<
    Persona,
    PersonaListingDTO,
    Persona,
    string | ObjectId, 
    ValidatedPersonaInput,
    (Persona & { _id: string | ObjectId }) 
> {
    protected service: IService<Persona, string | ObjectId> = ServiceFactory.personaService();

    protected entityToListingEntity = fromPersonaToListingDTO;

    protected entityToFullEntity = identity;

    protected validatedEntity = validatedPersona;
}