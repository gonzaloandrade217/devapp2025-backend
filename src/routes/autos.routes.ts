import { Router } from "express";
import { AutoController } from "../controllers/auto.controller";

const createAutosRoutes = (): Router => { 
  const router = Router();
  const controller = new AutoController(); 

  // BREAD Routes para Autos
  router.get("/", controller.getAutos.bind(controller));
  router.get("/:id", controller.getById.bind(controller));
  router.post("/", controller.create.bind(controller));
  router.put("/:id", controller.update.bind(controller));
  router.delete("/:id", controller.delete.bind(controller));

  return router;
};

export default createAutosRoutes;