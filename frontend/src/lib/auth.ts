import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        let isCorrectPassword = false;
        
        // Support unhashed demo accounts for hackathon
        if (user.password === credentials.password) {
          isCorrectPassword = true;
        } else {
          try {
            isCorrectPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );
          } catch (e) {
            isCorrectPassword = false;
          }
        }

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          companyId: user.companyId || undefined,
        };
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch full user to get role and companyId
        const dbUser = await db.user.findUnique({
          where: { id: user.id }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.companyId = dbUser.companyId || undefined;
        }
      }
      return token;
    }
  }
};
