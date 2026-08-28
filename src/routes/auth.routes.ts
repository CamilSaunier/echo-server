import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user account
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user, returns an access token, and sets a secure HTTP-only refresh token cookie
 * @access  Public
 */
router.post("/login", authController.login);

export default router;
