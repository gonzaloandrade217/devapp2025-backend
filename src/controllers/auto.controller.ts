import { Request, Response } from 'express';
import { AutoService } from "../services/auto.service";
import { ServiceFactory } from '../services/ServiceFactory';
import { Auto } from '../models/auto';
import { WithId } from 'mongodb';

export class AutoController {
    private service: AutoService;

    constructor(private autoService: AutoService) {
        this.service = ServiceFactory.autoService() as AutoService;
    }

    public getAutos = async (req: Request, res: Response): Promise<void> => {
        const personaID = req.query.personaID as string | undefined;
        let autos: WithId<Auto>[];

        if (personaID) {
            autos = await this.service.getAutosByPersonaId(personaID);
        } else {
            autos = await this.service.getAll();
        }
        res.status(200).json(autos);
    };

    public getById = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const auto = await this.service.getById(id);
        auto ? res.status(200).json(auto)
             : res.status(404).json({ message: 'Auto no encontrado' });
    };

    public create = async (req: Request, res: Response): Promise<void> => {
        const autoData: Omit<Auto, '_id'> = req.body;
        const nuevoAuto = await this.service.create(autoData);
        res.status(201).json(nuevoAuto); 
    };

    public update = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const autoData: Partial<Auto> = req.body;
        const autoActualizado = await this.service.update(id, autoData);
        autoActualizado ? res.status(200).json(autoActualizado)
                        : res.status(404).json({ message: 'Auto no encontrado' });
    };

    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
        const eliminado = await this.service.delete(id);
        eliminado ? res.status(204).end() 
                  : res.status(404).json({ message: 'Auto no encontrado' });
    };

    public getAutosByPersonaId = async (req: Request, res: Response): Promise<void> => {
        const { personaID } = req.params; 
        const autos = await this.autoService.getAutosByPersonaId(personaID);
        res.status(200).json(autos);
    };
}