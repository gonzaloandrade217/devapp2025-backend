import { Router } from "express";
import { AutoController } from "../controllers/auto.controller";

export default (autoController: AutoController) => { 
  const router = Router();

  // BREAD Routes para Autos
  router.get('/', autoController.getAutos); 
  router.post('/', autoController.create);
  router.put('/:id', autoController.update);
  router.delete('/:id', autoController.delete);
  router.get('/:id', autoController.getById);
  router.get('/byPersona/:personaId', autoController.getAutosByPersonaId); 

  return router;
};
