import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();
const port = 3001;

// Mount better-auth handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.listen(port, () => {
  console.log(`Mock auth server running on http://localhost:${port}`);
  console.log(`Auth endpoints available at http://localhost:${port}/api/auth/*`);
});
