import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("=== Database & Storage Verification ===");
  try {
    const userCount = await prisma.user.count();
    const tenderCount = await prisma.tender.count();
    const companyCount = await prisma.company.count();
    console.log(`[PASS] DB Connection OK. Users: ${userCount}, Tenders: ${tenderCount}, Companies: ${companyCount}`);

    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    const vaultExists = buckets.find(b => b.name === 'vault');
    if (vaultExists) {
      console.log("[PASS] Supabase Storage 'vault' bucket exists.");
    } else {
      console.log("[WARNING] 'vault' bucket not found. Attempting to create...");
      await supabase.storage.createBucket('vault', { public: false });
      console.log("[PASS] 'vault' bucket created.");
    }
  } catch (err: any) {
    console.error("[FAIL] Verification Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
