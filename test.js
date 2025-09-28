/**
 * Test script for XMLTV EPG service
 */

const SchedulesDirectAPI = require("./schedulesDirect");
const XmlTvBuilder = require("./xmlTvBuilder");
const config = require("./config");

async function testXmlTvBuilder() {
  console.log("Testing XMLTV Builder...");

  const channels = [
    { id: "98078", name: "2.1 KETS-1", icon: "" },
    { id: "44775", name: "2.2 KETS-2", icon: "" },
    { id: "30750", name: "3.1 CATCHY", icon: "" },
  ];

  const listings = [
    {
      channel: "98078",
      start: "2025-09-28T20:00:00Z",
      stop: "2025-09-28T21:00:00Z",
      title: "Test Show",
      sub: "Episode 1",
      desc: "A description with special characters like ' and \" and &.",
      icon: "http://example.com/icon.png",
      ddprogid: "EP123456789",
    },
  ];

  try {
    const xml = XmlTvBuilder.build(channels, listings);
    console.log("XMLTV generated successfully!");
    console.log("Length:", xml.length, "bytes");
    console.log("First 500 characters:");
    console.log(xml.substring(0, 500));
    console.log("...");

    // Save test XML
    const fs = require("fs");
    fs.writeFileSync("./test_xmltv.xml", xml);
    console.log("Saved to test_xmltv.xml");
  } catch (error) {
    console.error("Error generating XMLTV:", error);
  }
}

async function testSchedulesDirect() {
  console.log("\nTesting Schedules Direct API...");

  try {
    const sdAPI = new SchedulesDirectAPI(config);

    // Test authentication
    console.log("Testing authentication...");
    await sdAPI.authenticate();
    console.log("Authentication successful!");

    // Test getting lineups
    console.log("Testing lineup retrieval...");
    const lineups = await sdAPI.getLineups();
    console.log("Lineups retrieved:", lineups.lineups?.length || 0);
  } catch (error) {
    console.error("Schedules Direct API test failed:", error.message);
    console.log("Make sure to update your credentials in config.js");
  }
}

async function runTests() {
  console.log("XMLTV Little Rock EPG - Test Suite");
  console.log("==================================");

  await testXmlTvBuilder();
  await testSchedulesDirect();

  console.log("\nTest completed!");
  console.log("\nTo start the server:");
  console.log("1. Update credentials in config.js");
  console.log("2. Run: npm install");
  console.log("3. Run: npm start");
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testXmlTvBuilder, testSchedulesDirect };
