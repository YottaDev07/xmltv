/**
 * Vercel API handler for XMLTV EPG service
 * This file handles serverless function execution on Vercel
 */

const EPGService = require("./server");

// Create a single instance for reuse
let epgService = null;

function getEPGService() {
  if (!epgService) {
    epgService = new EPGService();
  }
  return epgService;
}

// Export the handler for Vercel
module.exports = async (req, res) => {
  try {
    const service = getEPGService();

    // Handle CORS for browser requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    // Route the request to the Express app
    await service.app(req, res);
  } catch (error) {
    console.error("Vercel handler error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
