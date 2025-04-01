// src/database.ts
import { Genero, Persona, Auto } from './models';

// Datos iniciales para pruebas
const autosIniciales: Auto[] = [
  {
    id: '1',
    marca: 'Ford',
    modelo: 'Fiesta',
    año: 2020,
    patente: 'ABC123',
    color: 'Rojo',
    numeroChasis: 'CH123456789',
    numeroMotor: 'EN123456789'
  },
  {
    id: '2',
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2022,
    patente: 'DEF456',
    color: 'Blanco',
    numeroChasis: 'CH987654321',
    numeroMotor: 'EN987654321'
  }
];

const personasIniciales: Persona[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    fechaNacimiento: new Date(1990, 5, 15),
    genero: Genero.Masculino,
    donanteOrganos: true,
    autos: [autosIniciales[0]]
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'Gómez',
    dni: '87654321',
    fechaNacimiento: new Date(1985, 3, 22),
    genero: Genero.Femenino,
    donanteOrganos: false,
    autos: [autosIniciales[1]]
  }
];

// Base de datos en memoria
let personasDB: Persona[] = [...personasIniciales];

// Funciones de acceso a datos
export const db = {
  // Personas
  getAllPersonas: (): Persona[] => personasDB,
  getPersonaById: (id: string): Persona | undefined => personasDB.find(p => p.id === id),
  addPersona: (persona: Omit<Persona, 'id'>): Persona => {
    const nuevaPersona: Persona = {
      ...persona,
      id: (personasDB.length + 1).toString(),
      autos: persona.autos || []
    };
    personasDB.push(nuevaPersona);
    return nuevaPersona;
  },
  updatePersona: (id: string, personaData: Partial<Omit<Persona, 'id'>>): Persona | undefined => {
    const index = personasDB.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    personasDB[index] = { ...personasDB[index], ...personaData };
    return personasDB[index];
  },
  deletePersona: (id: string): boolean => {
    const initialLength = personasDB.length;
    personasDB = personasDB.filter(p => p.id !== id);
    return personasDB.length !== initialLength;
  },
  
  // Autos
  addAutoToPersona: (personaId: string, auto: Omit<Auto, 'id'>): Auto | undefined => {
    const persona = personasDB.find(p => p.id === personaId);
    if (!persona) return undefined;
    
    const nuevoAuto: Auto = {
      ...auto,
      id: (persona.autos.length + 1).toString()
    };
    
    persona.autos.push(nuevoAuto);
    return nuevoAuto;
  },
  getAutoFromPersona: (personaId: string, autoId: string): Auto | undefined => {
    const persona = personasDB.find(p => p.id === personaId);
    if (!persona) return undefined;
    
    return persona.autos.find(a => a.id === autoId);
  },
  updateAutoFromPersona: (
    personaId: string, 
    autoId: string, 
    autoData: Partial<Omit<Auto, 'id'>>
  ): Auto | undefined => {
    const persona = personasDB.find(p => p.id === personaId);
    if (!persona) return undefined;
    
    const autoIndex = persona.autos.findIndex(a => a.id === autoId);
    if (autoIndex === -1) return undefined;
    
    persona.autos[autoIndex] = { ...persona.autos[autoIndex], ...autoData };
    return persona.autos[autoIndex];
  },
  deleteAutoFromPersona: (personaId: string, autoId: string): boolean => {
    const persona = personasDB.find(p => p.id === personaId);
    if (!persona) return false;
    
    const initialLength = persona.autos.length;
    persona.autos = persona.autos.filter(a => a.id !== autoId);
    return persona.autos.length !== initialLength;
  }
};