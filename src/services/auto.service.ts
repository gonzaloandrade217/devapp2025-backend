import { Auto } from "../interfaces/auto.interface";
import { AutoRepository } from "../repositories/auto.repository";
import { PersonaRepository } from "../repositories/persona.repository";

export class AutoService {
  private autoRepository = new AutoRepository();
  private personaRepository = new PersonaRepository();

  async getAutos(personaId?: number): Promise<Auto[]> {
    const autos = personaId 
      ? await this.autoRepository.getByPersonaId(personaId)
      : await this.autoRepository.getAll();
    
    return autos;
  }

  async getAutoById(id: number): Promise<Auto | null> {
    return this.autoRepository.getById(id);
  }

  async createAuto(personaId: number, autoData: Omit<Auto, 'id'>): Promise<Auto> {
    // Validar que la persona exista
    const persona = await this.personaRepository.getById(personaId);
    if (!persona) {
      throw new Error('La persona no existe');
    }

    // Validar datos mínimos
    if (!autoData.patente) {
      throw new Error('La patente es requerida');
    }

    return this.autoRepository.create({
      ...autoData,
      personaId
    });
  }

  async updateAuto(id: number, autoData: Partial<Auto>): Promise<Auto | null> {
    // Validar que no se intente cambiar el personaId
    if (autoData.personaId) {
      throw new Error('No se puede cambiar el dueño del auto');
    }

    return this.autoRepository.update(id, autoData);
  }

  async deleteAuto(id: number): Promise<boolean> {
    return this.autoRepository.delete(id);
  }
}