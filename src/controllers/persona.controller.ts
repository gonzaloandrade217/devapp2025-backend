import { Request, Response } from 'express';
import { PersonaService } from '../services/persona.service';
import { ServiceFactory } from '../services/ServiceFactory';

export class PersonaController {
    private service!: PersonaService;

    constructor() {
        this.service = ServiceFactory.personaService() as PersonaService;
    }

    getPersonas = async (req: Request, res: Response): Promise<void> => {
        const resultado = await this.service.getPersonasResumidas();
        res.status(200).json(resultado);
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const persona = await this.service.getById(id);
        persona ? res.status(200).json(persona)
            : res.status(404).json({ message: 'Persona no encontrada' });
    };

    update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const personaActualizada = await this.service.update(id, req.body);
        if (!personaActualizada) {
            res.status(404).json({ message: 'Persona no encontrada' });
            return;
        }
        res.status(201).json(personaActualizada);
    };

    create = async (req: Request, res: Response): Promise<void> => {
        const nuevaPersona = await this.service.create(req.body);
        res.status(200).json({ id: nuevaPersona._id });
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