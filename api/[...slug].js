import app from "../backend/server.js";

// Vercel catch-all serverless function for all /api/* routes
export default function handler(req, res) {
  return app(req, res);
}
