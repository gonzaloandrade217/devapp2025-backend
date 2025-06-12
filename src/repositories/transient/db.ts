import { UUID, Persona, Auto } from '../../models'; 
import { Temporal } from 'temporal-polyfill';
import process from 'process';

export type WithTransientId<T> = T & { _id: UUID }; 

const personas: Record<UUID, WithTransientId<Persona>> = {}; 
const autos: Record<UUID, WithTransientId<Auto>> = {}; 

if (process.env.SEED_DATA === 'true') {
    personas['1'] = {
        _id: '1', 
        dni: '123456789',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaDeNacimiento: new Temporal.PlainDate(1980, 4, 21),
        genero: 'masculino',
        donanteOrganos: true,
        autos: ['1', '2']
    };
}

export const db: {
    personas: Record<UUID, WithTransientId<Persona>>;
    autos: Record<UUID, WithTransientId<Auto>>;
    all: <T>(collection: Record<UUID, T & { _id: UUID }>) => Array<T & { _id: UUID }>; 
} = {
    personas,
    autos,
    all: <T>(collection: Record<UUID, T & { _id: UUID }>): Array<T & { _id: UUID }> => Object.values(collection)
};