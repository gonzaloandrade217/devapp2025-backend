import { Router } from 'express';
import { PersonaController } from '../controllers/persona.controller';

const router = Router();
const controller = new PersonaController();

// BREAD Routes
router.get("/", controller.getPersonas);         // Browse
router.get("/:id(\\d+)", controller.getById);   // Read
router.post("/", controller.create);             // Add
router.put("/:id(\\d+)", controller.update);    // Edit
router.delete("/:id(\\d+)", controller.delete); // Delete

export default router;