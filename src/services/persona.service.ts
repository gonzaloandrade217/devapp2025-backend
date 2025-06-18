import { WithId } from "mongodb";
import { Persona } from "../models/persona"; 
import { IService } from "./IService";
import { IRepository } from '../repositories/IRepository'; 
import { Auto } from '../models/auto'; 

export class PersonaService implements IService<Persona> {
    private personaRepository: IRepository<Persona>; 
    private autoRepository: IRepository<Auto>; 

    constructor(personaRepository: IRepository<Persona>, autoRepository: IRepository<Auto>) { 
        this.personaRepository = personaRepository;
        this.autoRepository = autoRepository;
    }

    public async getAll(): Promise<WithId<Persona>[]> {
        const personas = await this.personaRepository.getAll();
        return personas;
    }

    public async getById(id: string): Promise<WithId<Persona> | null> {
        const personaDoc = await this.personaRepository.getById(id);

        if (!personaDoc) {
            return null; 
        }

        const personaIdString = personaDoc._id.toHexString(); 
        let autosAsociados: Auto[] = [];

        try {
            if (this.autoRepository.getByPersonaId) { 
                const autosDocs = await this.autoRepository.getByPersonaId(personaIdString);
                autosAsociados = autosDocs.map(auto => ({
                    ...auto
                })) as Auto[]; 
            } else {
                console.warn("PersonaService: El 'autoRepository' no tiene implementado 'getByPersonaId'. Asegúrese de que el repositorio de autos lo implemente.");
            }

        } catch (error) {
            console.error(`Error al obtener autos para persona ID ${personaIdString}:`, error);
            autosAsociados = []; 
        }

        const personaConAutos: WithId<Persona> = {
            ...personaDoc,
            autos: autosAsociados 
        };

        return personaConAutos;
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

        const createdPersona = await this.personaRepository.create(dataToCreate);

        const personaWithEmptyAutos: WithId<Persona> = {
            ...createdPersona,
            autos: [] 
        };
        return personaWithEmptyAutos;
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

        const updated = await this.personaRepository.update(id, dataToUpdate);
        console.log("persona updated", updated);
        if (!updated) {
            console.log("Service: Repositorio no pudo actualizar/encontrar la Persona.");
            return null;
        } 
        console.log("Service: Repositorio actualizó Persona:", updated._id);
        
        const personaIdString = updated._id.toHexString();
        let autosAsociados: Auto[] = [];
        try {
            if (this.autoRepository.getByPersonaId) {
                autosAsociados = (await this.autoRepository.getByPersonaId(personaIdString)).map(auto => ({...auto})) as Auto[];
            } else {
                console.warn("PersonaService: El 'autoRepository' no tiene implementado 'getByPersonaId' durante la actualización.");
            }
        } catch (error) {
            console.error(`Error al obtener autos para persona ID ${personaIdString} durante la actualización:`, error);
        }

        const updatedPersonaWithAutos: WithId<Persona> = {
            ...updated,
            autos: autosAsociados
        };

        return updatedPersonaWithAutos;
    }

    public async delete(id: string): Promise<boolean> {
        return this.personaRepository.delete(id);
    }

    public async getPersonasResumidas(): Promise<{
        id: string;
        nombre: string;
        apellido: string;
        dni: string;
        genero: string;
        donanteOrganos: boolean
    }[]> {
        const personas = await this.personaRepository.getAll();
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