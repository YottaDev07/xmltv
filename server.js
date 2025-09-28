/**
 * Main Express server for XMLTV EPG service
 */

const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const cron = require("node-cron");

const config = require("./config");
const SchedulesDirectAPI = require("./schedulesDirect");
const XmlTvBuilder = require("./xmlTvBuilder");

class EPGService {
  constructor() {
    this.app = express();
    this.sdAPI = new SchedulesDirectAPI(config);
    this.cacheFile = path.join(config.cacheDir, "xmltv.xml");
    this.setupRoutes();
    this.setupCron();
  }

  /**
   * Setup Express routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
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

  /**
   * Authentication middleware
   */
  authenticate(req, res, next) {
    const key = req.query.key;
    if (key !== config.server.secretKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  }

  /**
   * Serve XMLTV feed
   */
  async serveXmltv(req, res) {
    try {
      // Check cache age
      const cacheAge = await this.getCacheAge();

      if (cacheAge < config.epg.cacheHours) {
        // Serve from cache
        const xmlContent = await fs.readFile(this.cacheFile, "utf8");
        res.set({
          "Content-Type": "application/xml; charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
          "Content-Length": Buffer.byteLength(xmlContent, "utf8"),
        });
        return res.send(xmlContent);
      }

      // Generate new XMLTV
      const xmlContent = await this.generateXmltv();

      // Save to cache
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

  /**
   * Generate XMLTV content
   */
  async generateXmltv() {
    try {
      console.log("Generating XMLTV feed...");

      // Get lineup data
      const lineups = await this.sdAPI.ensureOTALineup(
        config.epg.zipCode,
        config.epg.country
      );
      await fs.writeJson(
        path.join(config.cacheDir, "sd_lineups.json"),
        lineups,
        { spaces: 2 }
      );

      let stationIds = [];
      let lineupDetails = null;
      let chosenLineup = null;

      // Find OTA lineup
      for (const lineup of lineups.lineups || []) {
        if (
          lineup.transport &&
          (lineup.transport.includes("Antenna") ||
            lineup.transport.includes("Broadcast"))
        ) {
          chosenLineup = lineup.lineup;
          break;
        }
      }

      if (chosenLineup) {
        lineupDetails = await this.sdAPI.getLineupDetails(chosenLineup);
        const lineupStations = await this.sdAPI.getLineupStations(chosenLineup);

        await fs.writeJson(
          path.join(config.cacheDir, "sd_lineup_details.json"),
          lineupDetails,
          { spaces: 2 }
        );
        await fs.writeJson(
          path.join(config.cacheDir, "sd_lineup_stations.json"),
          lineupStations,
          { spaces: 2 }
        );

        stationIds =
          lineupStations.stations?.map((station) => station.stationID) || [];
      }

      // Fallback to configured channels
      if (stationIds.length === 0) {
        stationIds = Object.values(config.channels).map((ch) => ch.stationId);
      }

      console.log(`Fetching schedules for ${stationIds.length} stations...`);

      // Get schedules
      const schedules = await this.sdAPI.getSchedules(stationIds);
      await fs.writeJson(
        path.join(config.cacheDir, "sd_schedules.json"),
        schedules,
        { spaces: 2 }
      );

      if (!schedules || schedules.length === 0) {
        // Return channels only if no schedules
        return this.buildChannelsOnly(lineupDetails);
      }

      // Extract program IDs
      const programIds = [];
      for (const schedule of schedules) {
        if (schedule.programs) {
          programIds.push(...schedule.programs.map((p) => p.programID));
        }
      }

      console.log(`Fetching ${programIds.length} program details...`);

      // Get program details
      const programs = await this.sdAPI.getPrograms(programIds);
      await fs.writeJson(
        path.join(config.cacheDir, "sd_programs.json"),
        programs,
        { spaces: 2 }
      );

      // Build program lookup
      const programLookup = {};
      for (const program of programs) {
        programLookup[program.programID] = program;
      }

      // Build station lookup
      const stationLookup = {};
      if (lineupDetails && lineupDetails.stations) {
        for (const station of lineupDetails.stations) {
          stationLookup[station.stationID] = station;
        }
      }

      // Build channels and listings
      const channels = [];
      const listings = [];

      for (const schedule of schedules) {
        const stationId = schedule.stationID;
        const station = stationLookup[stationId] || {};

        // Find channel display name
        let channelName =
          station.callsign || station.name || `Channel-${stationId}`;
        const channelConfig = Object.values(config.channels).find(
          (ch) => ch.stationId === stationId
        );
        if (channelConfig) {
          channelName = `${channelConfig.name} ${channelName}`;
        }

        channels.push({
          id: stationId,
          name: channelName,
          icon: "",
        });

        // Add programs
        if (schedule.programs) {
          for (const program of schedule.programs) {
            const programData = programLookup[program.programID] || {};

            const startTime = new Date(program.airDateTime);
            const endTime = new Date(
              startTime.getTime() + program.duration * 1000
            );

            listings.push({
              channel: stationId,
              start: startTime.toISOString(),
              stop: endTime.toISOString(),
              title: programData.titles?.[0]?.title120 || "Unknown",
              sub: programData.episodeTitle150 || "",
              desc:
                programData.descriptions?.description1000?.[0]?.description ||
                "",
              icon: programData.hasImageArtwork
                ? `https://json.schedulesdirect.org/20141201/image/${program.programID}`
                : "",
              ddprogid: program.programID,
            });
          }
        }
      }

      await fs.writeJson(
        path.join(config.cacheDir, "sd_channels.json"),
        channels,
        { spaces: 2 }
      );
      await fs.writeJson(
        path.join(config.cacheDir, "sd_listings.json"),
        listings,
        { spaces: 2 }
      );

      // Build XMLTV
      const xmlContent = XmlTvBuilder.build(channels, listings);
      console.log(
        `Generated XMLTV with ${channels.length} channels and ${listings.length} programs`
      );

      return xmlContent;
    } catch (error) {
      console.error("Error generating XMLTV:", error);
      throw error;
    }
  }

  /**
   * Build channels-only XMLTV when no schedules available
   */
  buildChannelsOnly(lineupDetails) {
    const channels = [];

    if (lineupDetails && lineupDetails.stations) {
      for (const station of lineupDetails.stations) {
        const channelConfig = Object.values(config.channels).find(
          (ch) => ch.stationId === station.stationID
        );
        const channelName = channelConfig
          ? `${channelConfig.name} ${station.callsign || station.name}`
          : station.callsign || station.name || `Channel-${station.stationID}`;

        channels.push({
          id: station.stationID,
          name: channelName,
          icon: "",
        });
      }
    } else {
      // Fallback to configured channels
      for (const [channelNum, channelData] of Object.entries(config.channels)) {
        channels.push({
          id: channelData.stationId,
          name: `${channelNum} ${channelData.name}`,
          icon: "",
        });
      }
    }

    return XmlTvBuilder.build(channels, []);
  }

  /**
   * Get cache age in hours
   */
  async getCacheAge() {
    try {
      if (await fs.pathExists(this.cacheFile)) {
        const stats = await fs.stat(this.cacheFile);
        return (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      }
      return 999; // No cache file
    } catch (error) {
      return 999;
    }
  }

  /**
   * Setup cron job for automatic refresh
   */
  setupCron() {
    // Refresh every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      try {
        console.log("Running scheduled XMLTV refresh...");
        await this.generateXmltv();
        console.log("Scheduled refresh completed");
      } catch (error) {
        console.error("Scheduled refresh failed:", error);
      }
    });
  }

  /**
   * Error handling middleware
   */
  errorHandler(error, req, res, next) {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
  }

  /**
   * Start the server
   */
  start() {
    this.app.listen(config.server.port, config.server.host, () => {
      console.log(
        `XMLTV EPG Server running on http://${config.server.host}:${config.server.port}`
      );
      console.log(
        `XMLTV endpoint: http://${config.server.host}:${config.server.port}/xmltv?key=${config.server.secretKey}`
      );
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const epgService = new EPGService();
  epgService.start();
}

module.exports = EPGService;
