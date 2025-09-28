/**
 * Demo server for XMLTV EPG service
 * This version works without Schedules Direct credentials for testing
 */

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const config = require("./config");
const XmlTvBuilder = require("./xmlTvBuilder");

class DemoEPGService {
  constructor() {
    this.app = express();
    this.cacheFile = path.join(config.cacheDir, "xmltv.xml");
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "Node.js Demo",
        channels: Object.keys(config.channels).length,
      });
    });

    // Main XMLTV endpoint
    this.app.get(
      "/xmltv",
      this.authenticate.bind(this),
      this.serveXmltv.bind(this)
    );

    // Alternative endpoint for compatibility
    this.app.get(
      "/epg/xmltv-lr.php",
      this.authenticate.bind(this),
      this.serveXmltv.bind(this)
    );

    // Error handling middleware
    this.app.use(this.errorHandler.bind(this));
  }

  authenticate(req, res, next) {
    const key = req.query.key;
    if (key !== config.server.secretKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  async serveXmltv(req, res) {
    try {
      // Generate demo XMLTV
      const xmlContent = await this.generateDemoXmltv();

      // Save to cache
      await fs.ensureDir(config.cacheDir);
      await fs.writeFile(this.cacheFile, xmlContent, "utf8");

      // Serve response
      res.set({
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": Buffer.byteLength(xmlContent, "utf8"),
      });
      res.send(xmlContent);
    } catch (error) {
      console.error("Error serving XMLTV:", error);
      res.status(500).json({ error: "Failed to generate XMLTV feed" });
    }
  }

  async generateDemoXmltv() {
    console.log("Generating demo XMLTV feed...");

    // Build channels from config
    const channels = [];
    const listings = [];

    for (const [channelNum, channelData] of Object.entries(config.channels)) {
      channels.push({
        id: channelData.stationId,
        name: `${channelNum} ${channelData.name}`,
        icon: "",
      });

      // Generate some demo programs
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const startTime = new Date(now.getTime() + i * 2 * 60 * 60 * 1000); // Every 2 hours
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration

        listings.push({
          channel: channelData.stationId,
          start: startTime.toISOString(),
          stop: endTime.toISOString(),
          title: `Demo Program ${i + 1}`,
          sub: `Episode ${i + 1}`,
          desc: `This is a demo program for ${channelData.name} channel ${channelNum}`,
          icon: "",
          ddprogid: `DEMO${channelData.stationId}${i}`,
        });
      }
    }

    console.log(
      `Generated demo XMLTV with ${channels.length} channels and ${listings.length} programs`
    );

    // Build XMLTV
    const xmlContent = XmlTvBuilder.build(channels, listings);
    return xmlContent;
  }

  errorHandler(error, req, res, next) {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
  }

  start() {
    this.app.listen(config.server.port, config.server.host, () => {
      console.log(
        `XMLTV EPG Demo Server running on http://${config.server.host}:${config.server.port}`
      );
      console.log(
        `XMLTV endpoint: http://${config.server.host}:${config.server.port}/xmltv?key=${config.server.secretKey}`
      );
      console.log(
        `Health check: http://${config.server.host}:${config.server.port}/health`
      );
      console.log("\nThis is a DEMO version with sample data.");
      console.log(
        "To use real Schedules Direct data, update credentials in config.js"
      );
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const epgService = new DemoEPGService();
  epgService.start();
}

module.exports = DemoEPGService;
