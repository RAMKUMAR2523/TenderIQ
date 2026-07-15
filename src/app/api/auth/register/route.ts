import { NextResponse as Response } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COMPANY_ADMIN",
      }
    });

    return Response.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
