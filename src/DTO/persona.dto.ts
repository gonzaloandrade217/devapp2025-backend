import { Persona } from '../models/persona'; 
import { ObjectId } from 'mongodb'; 

export interface PersonaListingDTO {
    id: string; 
    dni: string;
    nombreCompleto: string; 
    genero: Persona['genero']; 
}

export const fromPersonaToListingDTO = (entity: Persona & { _id: string | ObjectId }): PersonaListingDTO => {
    const idString = typeof entity._id === 'string'
        ? entity._id 
        : entity._id.toHexString(); 

    return {
        id: idString, 
        dni: entity.dni,
        nombreCompleto: `${entity.nombre} ${entity.apellido}`,
        genero: entity.genero,
    };
};