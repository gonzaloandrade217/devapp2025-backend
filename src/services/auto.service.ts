import { Auto } from "../models/auto";
import { WithId } from "mongodb";
import { IService } from "./IService";
import { IRepository } from '../repositories/IRepository'; 
import { Persona } from "../models";

export class AutoService implements IService<Auto> {
    
    private autoRepository!: IRepository<Auto>;
    private personaRepository!: IRepository<Persona>;

    constructor(autoRepository: IRepository<Auto>, personaRepository: IRepository<Persona>) {
        this.autoRepository = autoRepository;
        this.personaRepository = personaRepository;
    }
    getAll(): Promise<WithId<Auto>[]> {
        throw new Error("Method not implemented.");
    }
    getById(id: string): Promise<WithId<Auto> | null> {
        throw new Error("Method not implemented.");
    }
    create(data: Omit<Auto, "_id" | "id">): Promise<WithId<Auto>> {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Partial<Auto>): Promise<WithId<Auto> | null> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public getAutosByPersonaId = async (personaId: string): Promise<WithId<Auto>[]> => {
        if ('getByPersonaId' in this.autoRepository && typeof this.autoRepository.getByPersonaId === 'function') {
            return await this.autoRepository.getByPersonaId(personaId);
        } else {
            throw new Error("El método 'getByPersonaId' no está implementado en este tipo de repositorio.");
        }
    };
}