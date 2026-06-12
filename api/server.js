import app from "../backend/server.js";

// Vercel serverless function entrypoint
export default function handler(req, res) {
  return app(req, res);
}
