import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users/search
 * @desc    Search users by username
 * @access  Private
 */
router.get("/search", authenticateToken, userController.searchUsers);

export const userRoutes: Router = router;
