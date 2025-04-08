import { Request, Response } from 'express';
import { PersonaService } from '../services/persona.service';

export class PersonaController {
  private service: PersonaService;

  constructor() {
    this.service = new PersonaService();
  }

  // Browse: Listar personas (datos resumidos)
  getPersonas = async (req: Request, res: Response): Promise<void> => {
    try {
      const resultado = await this.service.getPersonasResumidas();
      res.status(200).json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  // Read: Obtener persona por ID (datos completos)
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
      }

      const persona = await this.service.getPersonaById(id);
      
      persona ? res.status(200).json(persona)
              : res.status(404).json({ message: 'Persona no encontrada' });
    } catch (error) {
      console.error('Error en PersonaController:', error);
      res.status(500).json({ error: 'Error interno al obtener la persona' });
    }
  };

  // Edit: Actualización parcial
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
      }

      const personaActualizada = await this.service.updatePersona(id, req.body);
      
      if (!personaActualizada) {
        res.status(404).json({ message: 'Persona no encontrada' });
        return;
      }

      res.status(201).json(personaActualizada);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error en los datos proporcionados',
        details: error instanceof Error ? error.message : error
      });
    }
  };

  // Add: Crear nueva entidad
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const nuevaPersona = await this.service.createPersona(req.body);
      res.status(200).json({ id: nuevaPersona.id });
    } catch (error) {
      res.status(400).json({ 
        error: 'Error en los datos proporcionados',
        details: error instanceof Error ? error.message : error
      });
    }
  };

  // Delete: Eliminar entidad
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser un número válido' });
        return;
      }

      const eliminado = await this.service.deletePersona(id);
      
      if (!eliminado) {
        res.status(404).json({ message: 'Persona no encontrada' });
        return;
      }

      res.status(201).end();
    } catch (error) {
      res.status(500).json({ error: 'Error interno al eliminar la persona' });
    }
  };
}