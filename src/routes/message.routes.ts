import { Router } from "express";
import { MessageController } from "../controllers/message.controller";

const router = Router();
const messageController = new MessageController();

// Définition des routes pour les messages
router.get("/", messageController.getMessages);
router.post("/", messageController.createMessage);

export const messageRoutes = router;
