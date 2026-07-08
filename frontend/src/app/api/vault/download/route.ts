import { NextResponse as Response } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
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

    const { data, error } = await supabase.storage
      .from("vault")
      .createSignedUrl(doc.fileUrl, 3600); // 1 hour valid url

    if (error || !data) {
      return Response.json({ error: "Failed to generate download URL" }, { status: 500 });
    }

    return Response.redirect(data.signedUrl);
  } catch (error) {
    console.error("Download error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
