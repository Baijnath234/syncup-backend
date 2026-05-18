import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: ".env", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
