import { UUID, Persona, Auto } from '../../models'; 
import { Temporal } from 'temporal-polyfill';
import process from 'process';

export type WithTransientId<T> = T & { _id: UUID }; 

const personas: Record<UUID, WithTransientId<Persona>> = {}; 
const autos: Record<UUID, WithTransientId<Auto>> = {}; 

if (process.env.SEED_DATA === 'true') {
    personas['1'] = { 
        _id: '1', 
        id: '1', 
        dni: '123456789',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaDeNacimiento: new Temporal.PlainDate(1980, 4, 21),
        genero: 'masculino',
        donanteOrganos: true,
        autos: []
    };
    autos['101'] = { 
        _id: '101',
        id: '101', 
        patente: 'AA123BB', 
        marca: 'Ford',
        modelo: 'Fiesta',
        anio: 2018,
        color: 'Rojo',
        nroChasis: 'CHASIS123',
        nroMotor: 'MOTOR123',
        personaID: '1' 
    };
}

export const db: {
    personas: Record<UUID, WithTransientId<Persona>>;
    autos: Record<UUID, WithTransientId<Auto>>;
    all: <T extends { _id: UUID }>(collection: Record<UUID, T>) => Array<T>; 
} = {
    personas,
    autos,
    all: <T extends { _id: UUID }>(collection: Record<UUID, T>): Array<T> => Object.values(collection)
};