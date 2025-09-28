/**
 * Vercel-compatible XMLTV EPG service
 * This version is optimized for serverless deployment
 */

const express = require("express");
const fs = require("fs").promises;
const path = require("path");

// Import our modules
const config = require("../config");
const SchedulesDirectAPI = require("../schedulesDirect");
const XmlTvBuilder = require("../xmlTvBuilder");

// Create Express app
const app = express();

// Initialize API client
const sdAPI = new SchedulesDirectAPI(config);

// Cache directory (use /tmp for Vercel)
const cacheDir = "/tmp/cache";
const cacheFile = path.join(cacheDir, "xmltv.xml");

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(cacheDir, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error.message);
  }
}

// Authentication middleware
function authenticate(req, res, next) {
  const key = req.query.key || req.headers["x-api-key"];
  if (key === config.server.secretKey) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "Vercel XMLTV EPG Service",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main XMLTV endpoint
app.get("/xmltv", authenticate, async (req, res) => {
  try {
    console.log("Generating XMLTV feed...");

    // Ensure cache directory exists
    await ensureCacheDir();

    // Check if we have a cached version
    let cacheAgeHours = 999;
    try {
      const stats = await fs.stat(cacheFile);
      cacheAgeHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      console.log("No cached XMLTV found, will generate new one");
    }

    // Use cache if it's fresh enough
    if (cacheAgeHours < config.epg.cacheHours) {
      console.log(
        `Serving cached XMLTV (age: ${cacheAgeHours.toFixed(2)} hours)`
      );
      const cachedXml = await fs.readFile(cacheFile, "utf8");
      res.setHeader("Content-Type", "application/xml; charset=UTF-8");
      res.setHeader(
        "Cache-Control",
        `public, max-age=${config.epg.cacheHours * 3600}`
      );
      res.send(cachedXml);
      return;
    }

    // Generate new XMLTV
    console.log("Generating fresh XMLTV feed...");

    // For demo purposes, generate sample data
    const channels = [];
    const listings = [];
    const now = new Date();

    // Generate channels from config
    for (const displayChannel in config.channels) {
      const stationID = config.channels[displayChannel].stationId;
      channels.push({
        id: stationID,
        name: displayChannel,
        icon: "",
      });

      // Generate sample programs
      for (let i = 0; i < 3; i++) {
        const programStart = new Date(now.getTime() + i * 2 * 60 * 60 * 1000);
        const programStop = new Date(
          programStart.getTime() + 2 * 60 * 60 * 1000
        );

        listings.push({
          channel: stationID,
          start: programStart.toISOString(),
          stop: programStop.toISOString(),
          title: `Sample Program ${i + 1}`,
          sub: `Episode ${i + 1}`,
          desc: `This is a sample program for ${displayChannel}`,
          icon: "",
          ddprogid: `SAMPLE${stationID}${i}`,
        });
      }
    }

    // Build XMLTV
    const xml = XmlTvBuilder.build(channels, listings);

    // Cache the result
    try {
      await fs.writeFile(cacheFile, xml, "utf8");
    } catch (error) {
      console.warn("Could not cache XMLTV:", error.message);
    }

    // Send response
    res.setHeader("Content-Type", "application/xml; charset=UTF-8");
    res.setHeader(
      "Cache-Control",
      `public, max-age=${config.epg.cacheHours * 3600}`
    );
    res.send(xml);
  } catch (error) {
    console.error("Error generating XMLTV:", error);
    res.status(500).json({
      error: "Failed to generate XMLTV feed",
      message: error.message,
    });
  }
});

// Legacy endpoint for compatibility
app.get("/epg/xmltv-lr.php", authenticate, async (req, res) => {
  // Redirect to main endpoint
  res.redirect("/xmltv?key=" + req.query.key);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Express error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// Export the app for Vercel
module.exports = app;
