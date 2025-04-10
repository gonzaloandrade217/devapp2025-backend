import { Router } from 'express';
import { PersonaController } from '../controllers/persona.controller';

const router = Router();
const controller = new PersonaController();

// BREAD Routes
router.get("/", controller.getPersonas);         // Browse
router.get("/:id", controller.getById);          // Read
router.post("/", controller.create);             // Add
router.put("/:id", controller.update);           // Edit
router.delete("/:id", controller.delete);        // Delete

export default router;