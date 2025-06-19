import { Request, Response } from 'express';
import { PersonaService } from '../services/persona.service';
import { ServiceFactory } from '../services/ServiceFactory';
import { Persona } from '../models/persona'; 

export class PersonaController {
    private service!: PersonaService;

    constructor(private personaService: PersonaService) {
        this.service = ServiceFactory.personaService() as PersonaService;
    }

    getPersonas = async (req: Request, res: Response): Promise<void> => {
        const resultado = await this.service.getPersonasResumidas();
        res.status(200).json(resultado);
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const personaWithId = await this.service.getById(id); 

        if (!personaWithId) {
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }

        const personaParaFrontend: Persona = {
            id: personaWithId._id.toHexString(), 
            dni: personaWithId.dni,
            nombre: personaWithId.nombre,
            apellido: personaWithId.apellido,
            fechaDeNacimiento: personaWithId.fechaDeNacimiento,
            genero: personaWithId.genero,
            donanteOrganos: personaWithId.donanteOrganos,
            autos: personaWithId.autos, 
        };

        console.log("Datos de la persona enviados al frontend:", JSON.stringify(personaParaFrontend, null, 2));
        res.status(200).json(personaParaFrontend); 
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const personaActualizadaData = req.body;

        console.log("Controller: Recibiendo PUT para ID:", id);
        console.log("Controller: Datos recibidos para actualizar:", personaActualizadaData);

        const personaActualizada = await this.service.update(id, personaActualizadaData);
        console.log("Persona actualizada", personaActualizada);
        if (!personaActualizada) {
            console.log("Controller: Persona no encontrada para actualizar, devolviendo 404.");
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }
        console.log("Controller: Persona actualizada con éxito:", personaActualizada);
        const personaParaFrontend: Persona = {
            id: personaActualizada._id.toHexString(),
            dni: personaActualizada.dni,
            nombre: personaActualizada.nombre,
            apellido: personaActualizada.apellido,
            fechaDeNacimiento: personaActualizada.fechaDeNacimiento,
            genero: personaActualizada.genero,
            donanteOrganos: personaActualizada.donanteOrganos,
            autos: personaActualizada.autos,
        };
        res.status(201).json(personaParaFrontend);
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const nuevaPersona = await this.service.create(req.body);
        const personaParaFrontend: Persona = {
            id: nuevaPersona._id.toHexString(),
            dni: nuevaPersona.dni,
            nombre: nuevaPersona.nombre,
            apellido: nuevaPersona.apellido,
            fechaDeNacimiento: nuevaPersona.fechaDeNacimiento,
            genero: nuevaPersona.genero,
            donanteOrganos: nuevaPersona.donanteOrganos,
            autos: nuevaPersona.autos, 
        };
        res.status(200).json(personaParaFrontend);
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const eliminado = await this.service.delete(id);
        if (!eliminado) {
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }
        res.status(204).end();
    };
}