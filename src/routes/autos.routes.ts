import { Router } from "express";
import { AutoController } from "../controllers/auto.controller";

const router = Router();
const controller = new AutoController();

// BREAD Routes para Autos
router.get("/", controller.getAutos);          // Browse (Listar todos)
router.get("/:id", controller.getById);        // Read (Obtener por ID)
router.post("/", controller.create);           // Add (Crear)
router.put("/:id", controller.update);         // Edit (Actualizar)
router.delete("/:id", controller.delete);      // Delete (Eliminar)

export default router;