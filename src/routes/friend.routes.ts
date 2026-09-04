import { Router } from "express";
import { FriendController } from "../controllers/friend.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sendFriendRequestSchema, respondFriendRequestSchema } from "../validators/friend.validator.js";

const router = Router();
const friendController = new FriendController();

// Application globale du middleware d'authentification sur toutes les routes d'amis
router.use(authenticateToken);

/**
 * @route   GET /api/friends
 * @desc    Retrieves confirmed friends list for the authenticated user
 * @access  Private
 */
router.get("/", friendController.getFriends);

/**
 * @route   GET /api/friends/requests/pending
 * @desc    Retrieves pending incoming friend requests
 * @access  Private
 */
router.get("/requests/pending", friendController.getPendingRequests);

/**
 * @route   POST /api/friends/request
 * @desc    Sends a new friend request
 * @access  Private
 */
router.post("/request", validate(sendFriendRequestSchema), friendController.sendFriendRequest);

/**
 * @route   PATCH /api/friends/request/:friendshipId
 * @desc    Responds to a pending friend request (accept or decline)
 * @access  Private
 */
router.patch("/request/:friendshipId", validate(respondFriendRequestSchema), friendController.respondToFriendRequest);

/**
 * @route   DELETE /api/friends/:friendId
 * @desc    Removes a friend from user's friends list
 * @access  Private
 */
router.delete("/:friendId", friendController.removeFriend);

export const friendRoutes: Router = router;
