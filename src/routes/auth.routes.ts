import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user account with validation
 * @access  Public
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user with validation
 * @access  Public
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refreshes access token and rotates refresh token using HttpOnly cookie
 * @access  Public (Requires valid HttpOnly refresh token cookie)
 */
router.post("/refresh", authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logs out the user by revoking the refresh token and clearing the cookie
 * @access  Public (Clears cookie if present)
 */
router.post("/logout", authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieves the currently authenticated user's profile
 * @access  Private (Requires valid Access Token)
 */
router.get("/me", authenticateToken, authController.getMe);

export const authRoutes: Router = router;
