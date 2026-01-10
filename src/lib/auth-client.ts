import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3001",
  plugins: [adminClient()]
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgotPassword,
  resetPassword,
  admin
} = authClient;
