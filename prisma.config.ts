import "dotenv/config";
import { defineConfig } from "@prisma/config";

const datasource: Record<string, any> = {
  url: process.env.DATABASE_URL,
};

if (process.env.DIRECT_URL) {
  datasource.directUrl = process.env.DIRECT_URL;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: datasource as any,
});
