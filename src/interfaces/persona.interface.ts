// src/interfaces/persona.interface.ts

// Definición del enum para el género
export enum Genero {
    Masculino = 'Masculino',
    Femenino = 'Femenino',
    NoBinario = 'No-Binario'
  }
  
  // Interfaz principal para la entidad Persona
  export interface IPersona {
    nombre: string;
    apellido: string;
    dni: string;
    fechaNacimiento: Date;
    genero: Genero;
    donanteOrganos: boolean;
  }
  
  // Interfaz extendida para documentos MongoDB (si usas Mongoose)
  export interface IPersonaDocument extends IPersona, Document {
    // Aquí puedes agregar propiedades adicionales que Mongoose añade a los documentos
    // como createdAt, updatedAt, _id, etc.
    // Estas se heredan automáticamente de Document
  }