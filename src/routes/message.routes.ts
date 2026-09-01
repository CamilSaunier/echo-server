import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { validate } from "../middlewares/validate.middleware";
import { createMessageValidator } from "../validators/message.validator";

const router = Router();
const messageController = new MessageController();

/**
 * @route   GET /api/messages
 * @desc    Retrieves all messages
 * @access  Public
 */
router.get("/", messageController.getMessages);

/**
 * @route   POST /api/messages
 * @desc    Creates a new message with validation
 * @access  Public
 */
router.post("/", validate(createMessageValidator), messageController.createMessage);

export const messageRoutes: Router = router;
