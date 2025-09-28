# XMLTV Little Rock EPG - Node.js Version

A modern Node.js implementation of the XMLTV Electronic Program Guide service for Little Rock, Arkansas OTA channels.

## Features

- **Modern Node.js**: Built with Express.js for better performance and maintainability
- **Schedules Direct Integration**: Automatic lineup management and data fetching
- **Proper XML Escaping**: Handles special characters correctly to prevent parsing errors
- **Caching**: Intelligent caching system to reduce API calls and improve performance
- **Automatic Refresh**: Cron-based automatic updates every 6 hours
- **Error Handling**: Robust error handling and logging
- **Plex Compatible**: Generates XMLTV format compatible with Plex Media Server

## Installation

1. **Install Node.js** (version 16 or higher)

   ```bash
   # On macOS with Homebrew
   brew install node

   # Or download from https://nodejs.org/
   ```

2. **Install dependencies**

   ```bash
   cd nodejs-epg
   npm install
   ```

3. **Configure credentials**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env with your Schedules Direct credentials
   nano .env
   ```

4. **Update config.js**
   ```javascript
   schedulesDirect: {
     username: 'your_sd_username',
     password: 'your_sd_password',
     // ... other settings
   }
   ```

## Usage

### Start the server

```bash
npm start
```

### Development mode (with auto-restart)

```bash
npm run dev
```

### Test the implementation

```bash
npm test
```

## API Endpoints

- **Health Check**: `GET /health`
- **XMLTV Feed**: `GET /xmltv?key=your_secret_key`
- **Legacy Endpoint**: `GET /epg/xmltv-lr.php?key=your_secret_key`

## Configuration

### Environment Variables

| Variable      | Description               | Default |
| ------------- | ------------------------- | ------- |
| `SD_USERNAME` | Schedules Direct username | -       |
| `SD_PASSWORD` | Schedules Direct password | -       |
| `PORT`        | Server port               | 3000    |
| `HOST`        | Server host               | 0.0.0.0 |
| `SECRET_KEY`  | API secret key            | secret  |
| `EPG_DAYS`    | Number of days to fetch   | 7       |
| `CACHE_HOURS` | Cache duration in hours   | 6       |

### Channel Configuration

The service includes a complete mapping of Little Rock OTA channels:

- **2.1-2.4**: KETS (PBS) channels
- **3.1-3.6**: Catchy TV network channels
- **4.1-4.4**: KARK (NBC) channels
- **7.1-7.5**: ABC affiliate channels
- **11.1-11.8**: KTHV (CBS) channels
- **16.1-16.2**: KLRT (Fox) channels
- **18.1-18.14**: KTVV (Independent) channels
- **30.1-30.8**: KKYK channels
- **34.1-34.6**: KWMO channels
- **36.1-36.3**: KKAP channels
- **38.1-38.5**: KASN channels
- **42.1-42.2**: KARZ channels
- **49.1-49.6**: KMYA channels

## Plex Integration

1. **Add XMLTV Source**:

   - Go to Plex Settings → Live TV & DVR
   - Add XMLTV source
   - URL: `http://your-server:3000/xmltv?key=your_secret_key`

2. **Map Channels**:
   - Plex will automatically detect channels from the XMLTV feed
   - Map physical channels to guide channels as needed

## Performance Optimizations

- **Reduced Data**: Uses 7 days instead of 14 for smaller file size
- **Chunked Requests**: Splits API requests to stay within limits
- **Intelligent Caching**: Serves cached data when available
- **Proper Headers**: Sets appropriate cache headers for web delivery

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify Schedules Direct credentials
   - Check account status and lineup subscriptions

2. **Empty XMLTV**

   - Ensure OTA lineup is added to Schedules Direct account
   - Check logs for API errors

3. **XML Parsing Errors**
   - The Node.js version includes proper XML escaping
   - Clear cache and regenerate if needed

### Logs

Check console output for detailed logging:

```bash
npm start
```

### Cache Management

Cache files are stored in `./cache/`:

- `xmltv.xml` - Generated XMLTV feed
- `sd_*.json` - API response cache files

To clear cache:

```bash
rm -rf cache/*
```

## Development

### Project Structure

```
nodejs-epg/
├── config.js          # Configuration and channel mapping
├── schedulesDirect.js  # Schedules Direct API client
├── xmlTvBuilder.js    # XMLTV generation
├── server.js          # Express server and main logic
├── test.js            # Test suite
├── package.json       # Dependencies and scripts
└── cache/            # Cache directory (auto-created)
```

### Adding New Channels

Update `config.js`:

```javascript
channels: {
  'NEW.CHANNEL': { stationId: 'station_id', name: 'Channel Name' }
}
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review logs for error messages
3. Verify Schedules Direct account status
4. Test with the included test suite
