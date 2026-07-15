import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required").optional(),
  NEXTAUTH_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export function getEnv() {
  if (process.env.NODE_ENV !== "production") {
    return process.env as Record<string, string>;
  }

  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    // Return the process.env anyway to not crash build time processes.
    // At runtime, APIs should throw if specific keys are missing.
    return process.env as Record<string, string>;
  }
  
  return result.data;
}
