import { Auto } from "../models/auto";
import { IRepository } from "./IRepository";

export interface IAutoRepository<ID_TYPE = string> extends IRepository<Auto, ID_TYPE> { 
    getByPersonaId(personaId: string): Promise<Auto []>;
    getByPatente(patente: string): Promise<Auto | null>; 
}