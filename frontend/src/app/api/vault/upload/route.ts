import { NextResponse as Response } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";

// Using Service Role Key to bypass RLS for server-side uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// The backend .env has SUPABASE_SERVICE_ROLE_KEY, but frontend doesn't. 
// We will use the ANON key but since it's an API route we should ideally use the service role key.
// Let's use the env variable if available, else anon key (may fail RLS if not configured).
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bucketName = "vault";
    
    // Attempt to create bucket if it doesn't exist (fails silently if it does)
    await supabase.storage.createBucket(bucketName, { public: false });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.companyId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      return Response.json({ error: "Failed to upload to storage" }, { status: 500 });
    }

    // Save metadata to database
    const doc = await db.companyDocument.create({
      data: {
        companyId: session.user.companyId,
        name: file.name,
        type: fileExt?.toUpperCase() || "FILE",
        fileUrl: uploadData.path,
        status: "ACTIVE"
      }
    });

    return Response.json({ success: true, document: doc });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
