import { Persona } from '../models/persona'; // Asegúrate de que esta ruta sea correcta para tu tipo Persona
import { WithId } from 'mongodb'; // Si tus entidades MongoDB tienen _id, necesitarás esto

/**
 * Define la estructura de datos que se enviará para listar Personas.
 * Solo incluye las propiedades necesarias para la vista de listado.
 */
export interface PersonaListingDTO {
    id: string; // El ID de la persona (probablemente ObjectId de MongoDB convertido a string)
    dni: string;
    nombreCompleto: string; // Un ejemplo: nombre + apellido
    genero: Persona['genero']; // Reusa el tipo de genero de Persona
    // Añade aquí cualquier otra propiedad que desees en el listado
}

/**
 * Mapea una entidad Persona (con _id de MongoDB) a un PersonaListingDTO.
 * Esto transforma el objeto de la base de datos a un formato más adecuado para el cliente.
 */
export const fromPersonaToListingDTO = (entity: WithId<Persona>): PersonaListingDTO => {
    return {
        id: entity._id.toHexString(), // Convierte ObjectId a string
        dni: entity.dni,
        nombreCompleto: `${entity.nombre} ${entity.apellido}`,
        genero: entity.genero,
    };
};