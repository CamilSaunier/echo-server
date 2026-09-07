import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createMessageValidator } from "../validators/message.validator.js";

const router = Router();
const messageController = new MessageController();

/**
 * @route   GET /api/messages
 * @desc    Retrieves all messages for the authenticated user
 * @access  Private
 */
router.get("/", authenticateToken, messageController.getMessages);

/**
 * @route   POST /api/messages
 * @desc    Creates a new message with validation
 * @access  Private
 */
router.post("/", authenticateToken, validate(createMessageValidator), messageController.createMessage);

export const messageRoutes: Router = router;
