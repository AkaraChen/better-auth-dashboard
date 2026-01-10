import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors({
  credentials: true,
  origin: true,
}));

// Log all requests
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount better-auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("\x1b[31m%s\x1b[0m", "Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: err.stack
  });
});

app.listen(port, () => {
  console.log(`Mock auth server running on http://localhost:${port}`);
  console.log(`Auth endpoints available at http://localhost:${port}/api/auth/*`);
});
