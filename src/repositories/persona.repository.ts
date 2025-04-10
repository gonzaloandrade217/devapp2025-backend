import { Persona } from "../interfaces/persona.interface";
import { personas } from "../data/personas.data";

export class PersonaRepository {
  private personas: Persona[] = personas;
  private lastId = 0;

  
  async getAll(): Promise<Persona[]> {
    return Promise.resolve(this.personas);
  }

  async getById(id: number): Promise<Persona | null> {
    // Usamos el array importado directamente
    return personas.find(p => p.id === id) || null;
  }

  // Edit: Actualización parcial
  async update(id: number, personas: Partial<Persona>): Promise<Persona | null> {
      const index = this.personas.findIndex(p => p.id === id);
      if (index === -1) return Promise.resolve(null);
      
      this.personas[index] = { ...this.personas[index], ...personas };
      return Promise.resolve(this.personas[index]);
  }

  // Add: Crear nueva entidad
  async create(personas: Omit<Persona, 'id'>): Promise<Persona> {
      const newId = Math.max(...this.personas.map(p => p.id)) + 1;
      const nuevaPersona: Persona = { id: newId, ...personas };
      this.personas.push(nuevaPersona);
      return Promise.resolve(nuevaPersona);
  }

  // Delete: Eliminar entidad
  async delete(id: number): Promise<boolean> {
      const initialLength = this.personas.length;
      this.personas = this.personas.filter(p => p.id !== id);
      return Promise.resolve(this.personas.length < initialLength);
  }
}