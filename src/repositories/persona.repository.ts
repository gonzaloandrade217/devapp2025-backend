import { Persona } from "../interfaces/persona.interface";
import { personas } from "../data/personas.data";

export class PersonaRepository {
  private personas: Persona[] = [];
  private lastId = 0;

  getAll(): Persona[] {
    return personas; // Puede ser una consulta a DB luego.
  }

  async getById(id: number): Promise<Persona | null> {
    // Usamos el array importado directamente
    return personas.find(p => p.id === id) || null;
  }

    // Edit: Actualización parcial
    update(id: number, personaData: Partial<Persona>): Persona | null {
      const index = this.personas.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      this.personas[index] = { ...this.personas[index], ...personaData };
      return this.personas[index];
    }
  
    // Add: Crear nueva entidad
    create(personaData: Omit<Persona, 'id'>): Persona {
      this.lastId++;
      const nuevaPersona: Persona = { id: this.lastId, ...personaData };
      this.personas.push(nuevaPersona);
      return nuevaPersona;
    }
  
    // Delete: Eliminar entidad
    delete(id: number): boolean {
      const initialLength = this.personas.length;
      this.personas = this.personas.filter(p => p.id !== id);
      return this.personas.length < initialLength;
    }
}