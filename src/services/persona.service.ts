import { Persona } from "../interfaces/persona.interface";
import { PersonaRepository } from "../repositories/persona.repository";

export class PersonaService {
  private repository = new PersonaRepository();

  // Browse
  async getPersonasResumidas() {
    const personas = await this.repository.getAll();
    return personas.map(p => ({
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni
    }));
  }

  // Read
  async getPersonaById(id: number): Promise<Persona | null> {
    return this.repository.getById(id);
  }

  // Edit: Actualización parcial
  async updatePersona(id: number, personaData: Partial<Persona>): Promise<Persona | null> {
    // Validación adicional de datos
    if (personaData.dni && !this.validarDNI(personaData.dni)) {
      throw new Error('Formato de DNI inválido');
    }
    
    return this.repository.update(id, personaData);
  }

  // Add: Crear nueva entidad
  async createPersona(personaData: Omit<Persona, 'id'>): Promise<Persona> {
    // Validación de campos obligatorios
    if (!personaData.nombre || !personaData.dni) {
      throw new Error('Nombre y DNI son campos obligatorios');
    }
    
    return this.repository.create(personaData);
  }

  // Delete: Eliminar entidad
  async deletePersona(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  private validarDNI(dni: string): boolean {
    return /^\d{7,8}$/.test(dni);
  }
}