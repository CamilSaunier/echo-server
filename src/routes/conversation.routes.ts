// src/routes/conversation.routes.ts
import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const conversationController = new ConversationController();

/**
 * @route   GET /api/conversations
 * @desc    Retrieves all conversations for the authenticated user
 * @access  Private (Requires valid Access Token)
 */
router.get("/", authenticateToken, conversationController.getUserConversations);

/**
 * @route   GET /api/conversations/:conversationId/messages
 * @desc    Retrieves message history for a specific conversation
 * @access  Private (Requires valid Access Token and room membership)
 */
router.get("/:conversationId/messages", authenticateToken, conversationController.getConversationMessages);

export const conversationRoutes: Router = router;
