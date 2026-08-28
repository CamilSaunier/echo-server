import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { validate } from "../middlewares/validate.middleware";
import { createMessageValidator } from "../validators/message.validator";

const router = Router();
const messageController = new MessageController();

// Définition des routes pour les messages
router.get("/", messageController.getMessages);
router.post("/", validate(createMessageValidator), messageController.createMessage);

export const messageRoutes = router;
