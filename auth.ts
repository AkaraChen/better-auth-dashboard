import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: "http://localhost:3001",
  secret: "your-secret-key-change-in-production",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
});
