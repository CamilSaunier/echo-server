// src/routes/conversation.routes.ts
import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const conversationController = new ConversationController();

/**
 * @route   GET /api/conversations
 * @desc    Retrieves all conversations for the authenticated user
 * @access  Private
 */
router.get("/", authenticateToken, conversationController.getUserConversations);

/**
 * @route   POST /api/conversations/direct
 * @desc    Get or create a direct 1-to-1 conversation with a target user
 * @access  Private
 */
router.post("/direct", authenticateToken, conversationController.getOrCreateDirectConversation);

/**
 * @route   GET /api/conversations/:conversationId/messages
 * @desc    Retrieves message history for a specific conversation
 * @access  Private
 */
router.get("/:conversationId/messages", authenticateToken, conversationController.getConversationMessages);

export const conversationRoutes: Router = router;
