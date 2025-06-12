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
        
        const dataToCreate: Omit<Persona, '_id' | 'id'> = { ...personaData };
        
        if ('fechaNacimiento' in dataToCreate && typeof dataToCreate.fechaNacimiento === 'string' && !isNaN(new Date(dataToCreate.fechaNacimiento).getTime())) {
            dataToCreate.fechaNacimiento = new Date(dataToCreate.fechaNacimiento) as any; 
            console.log("Service: CONVERSIÓN DE FECHA (CREATE) APLICADA. Fecha después de conversión:", dataToCreate.fechaNacimiento);
        } else {
            console.log("Service: CONVERSIÓN DE FECHA (CREATE) NO APLICADA. Tipo o valor inesperado de fechaNacimiento:", typeof dataToCreate.fechaDeNacimiento, dataToCreate.fechaDeNacimiento);
        }

        return this.repository.create(dataToCreate);
    }

    public async update(id: string, personaData: Partial<Persona>): Promise<WithId<Persona> | null> {
        if (personaData.dni && !this.validarDNI(personaData.dni)) {
            throw new Error('Formato de DNI inválido');
        }

        const dataToUpdate: Partial<Persona> = { ...personaData };

        if ('fechaNacimiento' in dataToUpdate && typeof dataToUpdate.fechaNacimiento === 'string' && !isNaN(new Date(dataToUpdate.fechaNacimiento).getTime())) {
            dataToUpdate.fechaNacimiento = new Date(dataToUpdate.fechaNacimiento) as any; 
            console.log("Service: CONVERSIÓN DE FECHA (UPDATE) APLICADA. Fecha después de conversión:", dataToUpdate.fechaNacimiento);
        } else {
            console.log("Service: CONVERSIÓN DE FECHA (UPDATE) NO APLICADA. Tipo o valor inesperado de fechaNacimiento:", typeof dataToUpdate.fechaDeNacimiento, dataToUpdate.fechaDeNacimiento);
        }
        
        console.log("Service: Intentando actualizar Persona con ID:", id);
        console.log("Service: Datos que se enviarán al repositorio (con fecha potencialmente convertida):", dataToUpdate);

        const updated = await this.repository.update(id, dataToUpdate);
        console.log("persona updated", updated);
        if (!updated) {
            console.log("Service: Repositorio no pudo actualizar/encontrar la Persona.");
            return null;
        } 
        console.log("Service: Repositorio actualizó Persona:", updated._id);
        return updated;
    }

    public async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    public async getPersonasResumidas(): Promise<{
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
        genero: string;
        donanteOrganos: boolean
    }[]> {
        const personas = await this.repository.getAll();
        return personas.map(p => ({
            id: p._id.toHexString(),
            nombre: p.nombre,
            apellido: p.apellido,
            dni: p.dni,
            genero: p.genero,
            donanteOrganos: p.donanteOrganos
        }));
    }

    private validarDNI(dni: string): boolean {
        return /^\d{7,8}$/.test(dni);
    }
}