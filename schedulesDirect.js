/**
 * Schedules Direct API Client for Node.js
 * Handles authentication, lineup management, and data fetching
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

class SchedulesDirectAPI {
  constructor(config) {
    this.config = config;
    this.token = null;
    this.tokenFile = path.join(config.cacheDir, "sd_token.json");
    this.baseURL = config.schedulesDirect.baseUrl;
    this.userAgent = config.schedulesDirect.userAgent;

    // Create cache directory if it doesn't exist
    fs.ensureDirSync(config.cacheDir);
  }

  /**
   * Authenticate with Schedules Direct API
   */
  async authenticate() {
    try {
      // Try to load existing token
      if (await fs.pathExists(this.tokenFile)) {
        const tokenData = await fs.readJson(this.tokenFile);
        if (tokenData.token && tokenData.expires > Date.now()) {
          this.token = tokenData.token;
          return;
        }
      }

      // Authenticate with API
      const response = await axios.post(
        `${this.baseURL}/token`,
        {
          username: this.config.schedulesDirect.username,
          password: this.config.schedulesDirect.password,
        },
        {
          headers: {
            "User-Agent": this.userAgent,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0) {
        this.token = response.data.token;

        // Save token with expiration (24 hours)
        await fs.writeJson(this.tokenFile, {
          token: this.token,
          expires: Date.now() + 24 * 60 * 60 * 1000,
        });
      } else {
        throw new Error(`Authentication failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
      throw error;
    }
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(method, endpoint, data = null) {
    await this.authenticate();

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        "User-Agent": this.userAgent,
        token: this.token,
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error.message);
      throw error;
    }
  }

  /**
   * Get available lineups for a location
   */
  async getAvailableLineups(country, zipCode) {
    try {
      const response = await this.apiRequest(
        "GET",
        `/lineups?country=${country}&postalcode=${zipCode}`
      );
      return response;
    } catch (error) {
      console.error("Error getting available lineups:", error.message);
      throw error;
    }
  }

  /**
   * Get current lineups for the account
   */
  async getLineups() {
    try {
      const response = await this.apiRequest("GET", "/lineups");
      return response;
    } catch (error) {
      console.error("Error getting lineups:", error.message);
      throw error;
    }
  }

  /**
   * Add a lineup to the account
   */
  async addLineup(lineupId) {
    try {
      const response = await this.apiRequest("POST", "/lineups", lineupId);
      return response;
    } catch (error) {
      console.error("Error adding lineup:", error.message);
      throw error;
    }
  }

  /**
   * Get lineup details
   */
  async getLineupDetails(lineupId) {
    try {
      const response = await this.apiRequest("GET", `/lineups/${lineupId}`);
      return response;
    } catch (error) {
      console.error("Error getting lineup details:", error.message);
      throw error;
    }
  }

  /**
   * Get lineup stations
   */
  async getLineupStations(lineupId) {
    try {
      const response = await this.apiRequest(
        "GET",
        `/lineups/${lineupId}/stations`
      );
      return response;
    } catch (error) {
      console.error("Error getting lineup stations:", error.message);
      throw error;
    }
  }

  /**
   * Ensure OTA lineup is available
   */
  async ensureOTALineup(zipCode, country) {
    try {
      // Get current lineups
      let lineups = await this.getLineups();

      // Check if we have an OTA lineup
      const hasOTA = lineups.lineups?.some(
        (lu) =>
          lu.transport &&
          (lu.transport.includes("Antenna") ||
            lu.transport.includes("Broadcast"))
      );

      if (!hasOTA) {
        // Get available lineups
        const available = await this.getAvailableLineups(country, zipCode);

        // Find OTA lineup
        const otaLineup = available.lineups?.find(
          (lu) =>
            lu.transport &&
            (lu.transport.includes("Antenna") ||
              lu.transport.includes("Broadcast"))
        );

        if (otaLineup) {
          await this.addLineup(otaLineup.lineup);
          lineups = await this.getLineups();
        }
      }

      return lineups;
    } catch (error) {
      console.error("Error ensuring OTA lineup:", error.message);
      throw error;
    }
  }

  /**
   * Get schedules for stations
   */
  async getSchedules(stationIds) {
    try {
      const days = this.config.epg.days;
      const dates = [];

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split("T")[0]);
      }

      // Create payload for each station
      const payload = stationIds.map((stationId) => ({
        stationID: stationId.toString(),
        date: dates,
      }));

      // Split into chunks to avoid API limits
      const chunks = this.chunkArray(payload, 450);
      const allSchedules = [];

      for (const chunk of chunks) {
        const response = await this.apiRequest("POST", "/schedules", chunk);
        if (Array.isArray(response)) {
          allSchedules.push(...response);
        }
      }

      return allSchedules;
    } catch (error) {
      console.error("Error getting schedules:", error.message);
      throw error;
    }
  }

  /**
   * Get program details
   */
  async getPrograms(programIds) {
    try {
      // Split into chunks to avoid API limits (5000 max)
      const chunks = this.chunkArray(programIds, 4500);
      const allPrograms = [];

      for (const chunk of chunks) {
        const response = await this.apiRequest("POST", "/programs", chunk);
        if (Array.isArray(response)) {
          allPrograms.push(...response);
        }
      }

      return allPrograms;
    } catch (error) {
      console.error("Error getting programs:", error.message);
      throw error;
    }
  }

  /**
   * Utility function to chunk arrays
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

module.exports = SchedulesDirectAPI;
