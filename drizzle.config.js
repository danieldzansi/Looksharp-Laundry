import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: ["./models/model.js"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL, 
  },
});