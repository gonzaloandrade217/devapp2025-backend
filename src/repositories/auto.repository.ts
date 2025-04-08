import { Auto } from "../interfaces/auto.interface";
import { autos } from "../data/autos.data";

export class AutoRepository {
  private autosData: Auto[] = autos;

  async getAll(): Promise<Auto[]> {
    return Promise.resolve(this.autosData);
  }

  async getById(id: number): Promise<Auto | null> {
    return Promise.resolve(this.autosData.find(auto => auto.id === id) || null);
  }

  async getByPersonaId(personaId: number): Promise<Auto[]> {
    return Promise.resolve(this.autosData.filter(auto => auto.personaId === personaId));
  }

  async create(autoData: Omit<Auto, 'id'>): Promise<Auto> {
    const newId = Math.max(...this.autosData.map(a => a.id)) + 1;
    const nuevoAuto: Auto = { id: newId, ...autoData };
    this.autosData.push(nuevoAuto);
    return Promise.resolve(nuevoAuto);
  }

  async update(id: number, autoData: Partial<Auto>): Promise<Auto | null> {
    const index = this.autosData.findIndex(a => a.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.autosData[index] = { ...this.autosData[index], ...autoData };
    return Promise.resolve(this.autosData[index]);
  }

  async delete(id: number): Promise<boolean> {
    const initialLength = this.autosData.length;
    this.autosData = this.autosData.filter(a => a.id !== id);
    return Promise.resolve(this.autosData.length < initialLength);
  }
}