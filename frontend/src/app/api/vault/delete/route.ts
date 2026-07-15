import { NextResponse as Response } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";





export async function DELETE(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return Response.json({ error: "Missing document id" }, { status: 400 });
    }

    const doc = await db.companyDocument.findUnique({
      where: { id: docId, companyId: session.user.companyId }
    });

    if (!doc) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("vault")
      .remove([doc.fileUrl]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      return Response.json({ error: "Failed to delete from storage" }, { status: 500 });
    }

    // Delete from Prisma DB
    await db.companyDocument.delete({
      where: { id: docId }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

