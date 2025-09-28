/**
 * Simple test script for Vercel API
 */

const app = require("./api/xmltv");

// Test the health endpoint
const testHealth = async () => {
  console.log("Testing health endpoint...");

  const req = {
    method: "GET",
    url: "/health",
    query: {},
    headers: {},
  };

  const res = {
    status: (code) => {
      console.log(`Status: ${code}`);
      return res;
    },
    json: (data) => {
      console.log("Response:", JSON.stringify(data, null, 2));
      return res;
    },
    setHeader: () => res,
    send: (data) => {
      console.log("Response:", data.substring(0, 200) + "...");
      return res;
    },
  };

  try {
    await app(req, res);
    console.log("✅ Health endpoint test passed");
  } catch (error) {
    console.error("❌ Health endpoint test failed:", error.message);
  }
};

// Test the XMLTV endpoint
const testXmltv = async () => {
  console.log("\nTesting XMLTV endpoint...");

  const req = {
    method: "GET",
    url: "/xmltv",
    query: { key: "secret" },
    headers: {},
  };

  const res = {
    status: (code) => {
      console.log(`Status: ${code}`);
      return res;
    },
    json: (data) => {
      console.log("Error Response:", JSON.stringify(data, null, 2));
      return res;
    },
    setHeader: (name, value) => {
      console.log(`Header: ${name} = ${value}`);
      return res;
    },
    send: (data) => {
      console.log("XMLTV Response length:", data.length);
      console.log("First 200 chars:", data.substring(0, 200));
      return res;
    },
  };

  try {
    await app(req, res);
    console.log("✅ XMLTV endpoint test passed");
  } catch (error) {
    console.error("❌ XMLTV endpoint test failed:", error.message);
  }
};

// Run tests
(async () => {
  console.log("🧪 Testing Vercel API locally...\n");

  await testHealth();
  await testXmltv();

  console.log("\n✨ Tests completed!");
})();
