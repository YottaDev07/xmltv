# Vercel Deployment Guide for XMLTV EPG Service

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: For code repository
3. **Schedules Direct Account**: With valid credentials

## Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   cd /Volumes/Data/myProject/xmltv/nodejs-epg
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/xmltv-epg.git
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
cd /Volumes/Data/myProject/xmltv/nodejs-epg
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: xmltv-epg-service
# - Directory: ./
# - Override settings? No
```

### Option B: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

## Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add these variables:

| Variable          | Value                  | Description                         |
| ----------------- | ---------------------- | ----------------------------------- |
| `SD_USERNAME`     | `loymurray`            | Your Schedules Direct username      |
| `SD_PASSWORD`     | `LoyMurray123!`        | Your Schedules Direct password      |
| `SECRET_KEY`      | `your-secure-key-here` | Random secure string for API access |
| `CACHE_TTL_HOURS` | `12`                   | Cache duration in hours             |
| `EPG_DAYS`        | `14`                   | Days of EPG data to fetch           |

**Important**: Generate a secure `SECRET_KEY`:

```bash
# Generate a random secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Configure Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain (e.g., `epg.yourdomain.com`)
3. Update DNS records as instructed

## Step 5: Test Your Deployment

After deployment, test these endpoints:

- **Health Check**: `https://your-project.vercel.app/health`
- **XMLTV Feed**: `https://your-project.vercel.app/xmltv?key=YOUR_SECRET_KEY`
- **Legacy URL**: `https://your-project.vercel.app/epg/xmltv-lr.php?key=YOUR_SECRET_KEY`

## Step 6: Configure Plex

In Plex Media Server:

1. Go to **Settings** → **Live TV & DVR**
2. **Add XMLTV Source**:
   - **URL**: `https://your-project.vercel.app/xmltv?key=YOUR_SECRET_KEY`
   - **Name**: Little Rock EPG
3. **Map Channels**: Plex will detect all 72 channels automatically

## Important Notes

### Vercel Limitations:

- **Function Timeout**: 30 seconds max (configured in vercel.json)
- **Cold Starts**: First request may be slower
- **Memory**: 1GB limit per function
- **File System**: Read-only (except `/tmp`)

### Performance Optimizations:

- **Caching**: XMLTV is cached for 12 hours by default
- **Compression**: Vercel automatically compresses responses
- **CDN**: Global CDN for fast worldwide access

### Monitoring:

- **Vercel Analytics**: Built-in performance monitoring
- **Logs**: Available in Vercel dashboard
- **Health Check**: Use `/health` endpoint for monitoring

## Troubleshooting

### Common Issues:

1. **Timeout Errors**:

   - Reduce `EPG_DAYS` in environment variables
   - Check Schedules Direct API response times

2. **Authentication Errors**:

   - Verify `SD_USERNAME` and `SD_PASSWORD`
   - Check Schedules Direct account status

3. **Memory Issues**:

   - Reduce cache size
   - Optimize data processing

4. **Cold Start Delays**:
   - Use Vercel Pro plan for better performance
   - Implement keep-alive strategies

### Support:

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Check GitHub repository issues
- **Schedules Direct**: [schedulesdirect.org](https://schedulesdirect.org)

## Security Best Practices

1. **Secret Key**: Use a strong, random secret key
2. **Environment Variables**: Never commit credentials to Git
3. **HTTPS**: Always use HTTPS endpoints
4. **Rate Limiting**: Consider implementing rate limiting
5. **Monitoring**: Monitor for unusual usage patterns

## Cost Considerations

- **Vercel Free Tier**: 100GB bandwidth, 100GB-hours function execution
- **Pro Tier**: $20/month for higher limits and better performance
- **Schedules Direct**: $35/year for API access

Your XMLTV EPG service should now be live and accessible worldwide! 🚀
