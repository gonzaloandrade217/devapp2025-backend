import { Auto } from "./auto.interface";

export enum Genero {
  Masculino =   'Masculino',
  Femenino =    'Femenino',
  NoBinario =   'No-Binario'
}

export interface Persona {
  id:               number;
  nombre:           string;
  apellido:         string;
  dni:              string;
  fechaNacimiento:  Date;
  genero:           Genero;
  donanteOrganos:   boolean;
  autos:            Auto[];
}