import type { Request, Response, NextFunction } from "express";
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

  /**
   * Handles access token refresh requests and updates the HttpOnly cookie with a rotated token.
   *
   * @param req - Express Request object containing cookies.
   * @param res - Express Response object.
   * @param next - Express NextFunction for central error handling.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;

      const { accessToken, newRawRefreshToken, user } = await this.authClient.refreshAccessToken(rawRefreshToken);

      // met le nouveau refresh token (rotation) dans un cookie HttpOnly
      res.cookie("refreshToken", newRawRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles user logout by revoking the refresh token and clearing the authentication cookie.
   *
   * @param req - Express Request object containing cookies.
   * @param res - Express Response object used to clear the cookie and send the response.
   * @param next - Express NextFunction for error handling.
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      const { cookieOptions } = await this.authClient.logout(rawRefreshToken);

      res.clearCookie("refreshToken", cookieOptions);
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  };
}
