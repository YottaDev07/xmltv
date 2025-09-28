/**
 * Vercel API handler for XMLTV EPG service
 * Simple handler that routes to the main app
 */

const app = require("./xmltv");

// Export the handler for Vercel
module.exports = app;
