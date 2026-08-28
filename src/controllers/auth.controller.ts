import { Request, Response, NextFunction } from "express";
import { AuthClient } from "../clients/auth.client";

export class AuthController {
  private authClient = new AuthClient();

  /**
   * Handles user registration.
   *
   * @param req - Express request object containing email, username, and password in the body.
   * @param res - Express response object.
   * @param next - Express next function for error handling propagation.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username, password } = req.body;

      const newUser = await this.authClient.register({ email, username, password });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      });
    } catch (error) {
      next(error); // Forwards the error to the global error handling middleware (AppError)
    }
  };

  /**
   * Handles user login and sets the secure HttpOnly cookie for the refresh token.
   *
   * @param req - Express request object containing email and password in the body.
   * @param res - Express response object.
   * @param next - Express next function for error handling propagation.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const { accessToken, refreshToken, user } = await this.authClient.login({ email, password });

      // Secure injection of the Refresh Token into an HttpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Inaccessible via JavaScript (anti-XSS)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict", // Protection against CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next(error); // Forwards the error to the global error handling middleware (AppError)
    }
  };

  /**
   * Retrieves the current authenticated user's profile.
   *
   * @param req - Express request object containing user payload from auth middleware.
   * @param res - Express response object.
   * @param next - Express next function for error handling propagation.
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Le middleware garantit que req.user existe, on fait confiance au type TypeScript
      const user = await this.authClient.getProfile(req.user!.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
