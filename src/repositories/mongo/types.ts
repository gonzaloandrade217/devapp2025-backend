import { ObjectId } from 'mongodb'; 

export type MongoDBCodigoGenero = 'masculino' | 'femenino' | 'no binario';

export interface MongoDBAuto {
    _id: ObjectId;
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    nroChasis: string;
    nroMotor: string;
    personaID: ObjectId; 
}

export interface MongoDBPersona {
    _id: ObjectId;
    dni: string;
    nombre: string;
    apellido: string;
    fechaDeNacimiento: Date; 
    genero: MongoDBCodigoGenero;
    donanteOrganos: boolean;
}