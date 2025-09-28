/**
 * Configuration for XMLTV Little Rock EPG Service
 */

const config = {
  // Schedules Direct API credentials
  schedulesDirect: {
    username: process.env.SD_USERNAME || "ryan1111",
    password: process.env.SD_PASSWORD || "WolAJinVenus",
    userAgent: "LR-EPG-NodeJS/1.0 (https://github.com/your-repo)",
    baseUrl: "https://json.schedulesdirect.org/20141201",
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
    secretKey: process.env.SECRET_KEY || "secret",
  },

  // EPG configuration
  epg: {
    zipCode: "72201",
    country: "USA",
    days: parseInt(process.env.EPG_DAYS) || 7, // Reduced for better performance
    cacheHours: parseInt(process.env.CACHE_HOURS) || 6,
  },

  // Cache directory
  cacheDir: "./cache",

  // Channel mapping for Little Rock DMA
  channels: {
    2.1: { stationId: "98078", name: "KETS-1" },
    2.2: { stationId: "44775", name: "KETS-2" },
    2.3: { stationId: "44781", name: "KETS-3" },
    2.4: { stationId: "44777", name: "KETS-4" },
    3.1: { stationId: "30750", name: "CATCHY" },
    3.2: { stationId: "100665", name: "TOONS" },
    3.3: { stationId: "106047", name: "MeTV+" },
    3.4: { stationId: "114085", name: "MOVIES" },
    3.5: { stationId: "33694", name: "STORY" },
    3.6: { stationId: "33696", name: "WEST" },
    4.1: { stationId: "65902", name: "KARK-DT" },
    4.2: { stationId: "102364", name: "Laff" },
    4.3: { stationId: "132386", name: "Grit" },
    4.4: { stationId: "31316", name: "Antenna" },
    7.1: { stationId: "50887", name: "ABC" },
    7.2: { stationId: "91516", name: "Comet" },
    7.3: { stationId: "106921", name: "Charge!" },
    7.4: { stationId: "114177", name: "ROAR" },
    7.5: { stationId: "119387", name: "TheNest" },
    11.1: { stationId: "125350", name: "KTHV-DT" },
    11.2: { stationId: "31257", name: "CourtTV" },
    11.3: { stationId: "62460", name: "Crime" },
    11.4: { stationId: "110490", name: "Quest" },
    11.5: { stationId: "73146", name: "NOSEY" },
    11.6: { stationId: "73043", name: "Confess" },
    11.7: { stationId: "103012", name: "BUSTED" },
    11.8: { stationId: "103013", name: "ShopLC" },
    16.1: { stationId: "35647", name: "KLRT-TV" },
    16.2: { stationId: "100860", name: "IonMyst" },
    18.1: { stationId: "100873", name: "KTVV-LD" },
    18.2: { stationId: "100874", name: "Bridge1" },
    18.3: { stationId: "100875", name: "Bridge2" },
    18.4: { stationId: "100876", name: "AceTV" },
    18.5: { stationId: "100877", name: "OAN" },
    18.6: { stationId: "88824", name: "beIN" },
    18.7: { stationId: "89191", name: "Sales" },
    18.8: { stationId: "91905", name: "BarkTV" },
    18.9: { stationId: "116247", name: "ZLiving" },
    "18.10": { stationId: "116248", name: "FTF" },
    18.11: { stationId: "116249", name: "MTRSPR1" },
    18.12: { stationId: "116250", name: "AWE" },
    18.13: { stationId: "116251", name: "NBT" },
    18.14: { stationId: "63693", name: "Sales2" },
    30.1: { stationId: "32414", name: "KKYK-CD" },
    30.2: { stationId: "55037", name: "TeleX" },
    30.3: { stationId: "121086", name: "Movies" },
    30.4: { stationId: "121087", name: "BUZZ" },
    30.5: { stationId: "121088", name: "Binge2" },
    30.7: { stationId: "116253", name: "N2" },
    30.8: { stationId: "116254", name: "JTV_SP" },
    34.1: { stationId: "116255", name: "KWMO-LD" },
    34.2: { stationId: "116256", name: "KWMO-LD" },
    34.3: { stationId: "116257", name: "KWMO-LD" },
    34.4: { stationId: "116258", name: "KWMO-LD" },
    34.5: { stationId: "55662", name: "KWMO-LD" },
    34.6: { stationId: "55664", name: "KWMO-LD" },
    36.1: { stationId: "106218", name: "KKAP-DT" },
    36.2: { stationId: "80316", name: "KKAP-ES" },
    36.3: { stationId: "80317", name: "KKAP-SD" },
    38.1: { stationId: "80318", name: "KASN-HD" },
    38.2: { stationId: "80319", name: "Rewind" },
    38.3: { stationId: "80320", name: "ION" },
    38.4: { stationId: "80321", name: "IonPlus" },
    38.5: { stationId: "44002", name: "Grit" },
    42.1: { stationId: "44775", name: "KARZ-DT" },
    42.2: { stationId: "44781", name: "Bounce" },
    49.1: { stationId: "44777", name: "KMYALD1" },
    49.2: { stationId: "30750", name: "Cozi" },
    49.3: { stationId: "100665", name: "Heroes" },
    49.4: { stationId: "106047", name: "StartTV" },
    49.5: { stationId: "114085", name: "Sonlife" },
    49.6: { stationId: "33694", name: "DABL" },
  },
};

module.exports = config;
