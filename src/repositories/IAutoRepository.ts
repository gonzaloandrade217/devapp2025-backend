import { Auto } from "../models/auto";
import { IRepository } from "./IRepository";
import { ObjectId } from "mongodb";

export interface IAutoRepository<ID_TYPE = ObjectId> extends IRepository<Auto, ID_TYPE> { 
    getByPersonaId(personaId: string): Promise<(Auto & { _id: ID_TYPE })[]>;
    getByPatente(patente: string): Promise<(Auto & { _id: ID_TYPE }) | null>; 
}