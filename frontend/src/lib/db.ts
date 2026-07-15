import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is missing during build time. Using mock database connection.");
    return new PrismaClient({ datasourceUrl: "postgresql://mock:mock@localhost:5432/mock" });
  }
  
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  return globalThis.prisma;
};

export const db = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    return (getPrisma() as any)[prop];
  }
});
