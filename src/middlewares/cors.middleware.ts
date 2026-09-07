import cors from "cors";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const corsMiddleware = cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
