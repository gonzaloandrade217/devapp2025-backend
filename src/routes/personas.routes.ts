import { Router } from 'express';
import { PersonaController } from '../controllers/persona.controller';

const createPersonasRoutes = (): Router => { 
  const router = Router();
  const controller = new PersonaController(); 

  // BREAD Routes
  router.get("/", controller.getPersonas.bind(controller)); 
  router.get("/:id", controller.getById.bind(controller));
  router.post("/", controller.create.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};

export default createPersonasRoutes;