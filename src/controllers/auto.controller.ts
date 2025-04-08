import { Request, Response } from 'express';
import { AutoService } from "../services/auto.service";

export class AutoController {
  private service = new AutoService();

  // Browse: Listar autos 
  getAutos = async (req: Request, res: Response): Promise<void> => {
    try {
      const personaId = req.query.personaId 
        ? Number(req.query.personaId) 
        : undefined;

      if (personaId !== undefined && isNaN(personaId)) {
        res.status(400).json({ error: 'personaId debe ser numérico' });
        return;
      }

      const autos = await this.service.getAutos(personaId);
      res.status(200).json(autos);
    } catch (error) {
      console.error('Error en getAutos:', error);
      res.status(500).json({ error: 'Error al obtener autos' });
    }
  };

  // Read: Obtener auto por ID
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser numérico' });
        return;
      }

      const auto = await this.service.getAutoById(id);
      
      auto ? res.status(200).json(auto)
           : res.status(404).json({ message: 'Auto no encontrado' });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: 'Error al obtener auto' });
    }
  };

  // Add: Crear nuevo auto
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { personaId, ...autoData } = req.body;
      
      if (!personaId) {
        res.status(400).json({ error: 'personaId es requerido' });
        return;
      }

      const personaIdNum = Number(personaId);
      if (isNaN(personaIdNum)) {
        res.status(400).json({ error: 'personaId debe ser numérico' });
        return;
      }

      const nuevoAuto = await this.service.createAuto(personaIdNum, autoData);
      res.status(200).json(nuevoAuto);
    } catch (error) {
      console.error('Error en create:', error);
      res.status(400).json({ 
        error: 'Error al crear auto',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Edit: Actualizar auto
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const autoData = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser numérico' });
        return;
      }

      const autoActualizado = await this.service.updateAuto(id, autoData);
      
      autoActualizado ? res.status(200).json(autoActualizado)
                     : res.status(404).json({ message: 'Auto no encontrado' });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(400).json({ 
        error: 'Error al actualizar auto',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  };

  // Delete: Eliminar auto
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID debe ser numérico' });
        return;
      }

      const eliminado = await this.service.deleteAuto(id);
      
      eliminado ? res.status(200).json({ message: 'Auto eliminado' })
               : res.status(404).json({ message: 'Auto no encontrado' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: 'Error al eliminar auto' });
    }
  };
}