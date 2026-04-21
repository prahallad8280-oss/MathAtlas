import path from "node:path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const portValue = process.env.PORT ?? "4000";

export const config = {
  port: Number.parseInt(portValue, 10),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
};
