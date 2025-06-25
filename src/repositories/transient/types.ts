import { Temporal } from 'temporal-polyfill';

export type UUID = string; 

export type TransientGenero = 'masculino' | 'femenino' | 'no binario';

export type TransientAuto = {
    id: UUID;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    nroChasis: string;
    nroMotor: string;
    personaID: UUID;
};

export type TransientPersona = {
    id: UUID;
    dni: string;
    nombre: string;
    apellido: string;
    fechaDeNacimiento: Temporal.PlainDate;
    genero: TransientGenero;
    donanteOrganos: boolean;
    autos: TransientAuto[];
};

export type WithTransientId<T> = T & { _id: UUID };