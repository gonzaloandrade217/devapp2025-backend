import { Router } from 'express';
import { PersonaController } from '../controllers/persona.controller';

export default (personaController: PersonaController) => {
  const router = Router();

  // BREAD Routes para Personas
  router.get('/', personaController.getPersonas); 
  router.post('/', personaController.create); 
  router.get('/:id', personaController.getById); 
  router.put('/:id', personaController.update); 
  router.delete('/:id', personaController.delete);

  return router;
};
