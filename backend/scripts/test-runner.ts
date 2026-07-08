import fetch from "node-fetch"; // need to use global fetch if Node 18+

const BASE_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:5000";

async function testApi(name: string, url: string, options?: any) {
  console.log(`[TEST] Starting: ${name} (${options?.method || 'GET'} ${url})`);
  const start = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - start;
    if (!res.ok) {
      console.error(`[FAIL] ${name} - Status: ${res.status} (${duration}ms)`);
      const text = await res.text();
      console.error(`Response: ${text}`);
      return false;
    }
    console.log(`[PASS] ${name} - Status: ${res.status} (${duration}ms)`);
    return true;
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`[ERROR] ${name} - ${error.message} (${duration}ms)`);
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  console.log("=== Running API Tests ===");

  // 1. Backend Health Check
  (await testApi("Backend Health Check", `${BACKEND_URL}/health`)) ? passed++ : failed++;

  // 2. Crawler endpoint
  (await testApi("CPPP Crawler", `${BACKEND_URL}/api/crawl/cppp`, { method: "POST" })) ? passed++ : failed++;

  // 3. Frontend Home page (static render test)
  (await testApi("Frontend Home Page", `${BASE_URL}/`)) ? passed++ : failed++;

  // 4. API Registration (Duplicate/Invalid Test)
  (await testApi("API Register (Duplicate)", `${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "QA User", email: "admin@techsolutions.com", password: "password123" })
  })) ? passed++ : failed++;

  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
}

runTests();
