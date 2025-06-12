import { Auto } from "../models/auto"; 
import { WithId } from "mongodb";
import { IService } from "./IService"; 
import { IRepository } from '../repositories/IRepository'; 
import { Persona } from "../models"; 

export class AutoService implements IService<Auto> {
    
    private autoRepository: IRepository<Auto>;
    private personaRepository: IRepository<Persona>; 

    constructor(autoRepository: IRepository<Auto>, personaRepository: IRepository<Persona>) {
        this.autoRepository = autoRepository;
        this.personaRepository = personaRepository;
    }

    public async getAll(): Promise<WithId<Auto>[]> {
        return await this.autoRepository.getAll(); 
    }

    public async getById(id: string): Promise<WithId<Auto> | null> {
        return await this.autoRepository.getById(id);
    }

    public async create(data: Omit<Auto, "_id" | "id">): Promise<WithId<Auto>> {
        return await this.autoRepository.create(data);
    }

    public async update(id: string, data: Partial<Auto>): Promise<WithId<Auto> | null> {
        return await this.autoRepository.update(id, data);
    }

    public async delete(id: string): Promise<boolean> {
        return await this.autoRepository.delete(id);
    }

    public getAutosByPersonaId = async (personaId: string): Promise<WithId<Auto>[]> => {
        return await this.autoRepository.getByPersonaId!(personaId);
    };
}