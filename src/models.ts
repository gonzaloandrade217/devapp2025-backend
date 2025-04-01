// Enums para valores predefinidos
export enum Genero {
    Masculino = 'Masculino',
    Femenino = 'Femenino',
    NoBinario = 'No-Binario'
}
  
// Entidad Auto
export interface Auto {
    id: string; // Identificador único
    marca: string;
    modelo: string;
    año: number;
    patente: string;
    color: string;
    numeroChasis: string;
    numeroMotor: string;
}
  
// Entidad Persona
export interface Persona {
    id: string; 
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    genero: Genero;
    donanteOrganos: boolean;
    autos: Auto[]; // Relación uno-a-muchos (una persona tiene muchos autos)
}
