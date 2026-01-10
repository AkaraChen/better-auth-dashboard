import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
  baseURL: "http://localhost:3001",
  secret: "your-secret-key-change-in-production",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), organization()],
  database: new Database("./data.db"),
  trustedOrigins: [
    'http://localhost:5173'
  ]
});
