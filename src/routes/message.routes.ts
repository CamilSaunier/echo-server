import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { validate } from "../middlewares/validate.middleware";
import { createMessageSchema } from "../schemas/message.schema";

const router = Router();
const messageController = new MessageController();

// Définition des routes pour les messages
router.get("/", messageController.getMessages);
router.post("/", validate(createMessageSchema), messageController.createMessage);

export const messageRoutes = router;
