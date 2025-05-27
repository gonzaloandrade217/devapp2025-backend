import { WithId } from "mongodb";
import { Persona } from "../models/persona";
import { IService } from "./IService";
import { IRepository } from '../repositories/IRepository';

export class PersonaService implements IService<Persona> {
    private repository!: IRepository<Persona>;

    constructor(personaRepository: IRepository<Persona>) {
        this.repository = personaRepository;
    }

    public async getAll(): Promise<WithId<Persona>[]> {
        const personas = await this.repository.getAll();
        return personas;
    }

    public async getById(id: string): Promise<WithId<Persona> | null> {
        return this.repository.getById(id);
    }

    public async create(personaData: Omit<Persona, '_id' | 'id'>): Promise<WithId<Persona>> {
        if (!personaData.nombre || !personaData.dni) {
            throw new Error('Nombre y DNI son campos obligatorios');
        }
        return this.repository.create(personaData);
    }

    public async update(id: string, personaData: Partial<Persona>): Promise<WithId<Persona> | null> {
        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            throw new Error('Formato de DNI inválido');
        }
        return this.repository.update(id, personaData);
    }

    public async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    public async getPersonasResumidas(): Promise<{ id: string; nombre: string; apellido: string; dni: string; }[]> {
        const personas = await this.repository.getAll();
        return personas.map(p => ({
            id: p._id.toHexString(),
            nombre: p.nombre,
            apellido: p.apellido,
            dni: p.dni
        }));
    }

    private validarDNI(dni: string): boolean {
        return /^\d{7,8}$/.test(dni);
    }
}