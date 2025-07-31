# A.Insiders News Cache Server

A server-side caching system for news feeds that provides instant loading for all users, not just returning visitors.

## 🚀 Features

- **Server-side caching** - Feeds are cached on the server for all users
- **Instant loading** - New users get cached content immediately
- **Live updates** - Background refresh keeps content fresh
- **Category-based caching** - Each news category is cached separately
- **Cache management** - Tools for monitoring and maintaining cache
- **API endpoints** - RESTful API for cache operations

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the cache server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## 🔧 API Endpoints

### Get Cached Feeds
- `GET /api/cache` - Get all cached feeds
- `GET /api/cache/:category` - Get cached feeds for specific category

### Store Feeds
- `POST /api/cache/:category` - Store feeds for a category

### Cache Management
- `GET /api/cache/status` - Get cache status and statistics
- `POST /api/cache/:category/refresh` - Force refresh cache for category
- `DELETE /api/cache/:category` - Clear cache for specific category
- `DELETE /api/cache` - Clear all cache

## 🛠️ Cache Management

### Check Cache Status
```bash
npm run cache-status
# or
node cache-manager.js status
```

### Clear Cache
```bash
# Clear all cache
npm run cache-clear
# or
node cache-manager.js clear

# Clear specific category
node cache-manager.js clear AI
```

### Refresh Cache
```bash
# Refresh all cache
npm run cache-refresh
# or
node cache-manager.js refresh

# Refresh specific category
node cache-manager.js refresh AI
```

### Backup and Restore
```bash
# Create backup
node cache-manager.js backup

# Restore from backup
node cache-manager.js restore
```

## 📁 File Structure

```
├── server-cache.js          # Main cache server
├── cache-manager.js         # Cache management utility
├── package.json            # Dependencies and scripts
├── cache/                  # Cache storage directory
│   ├── AI.json            # Cached AI articles
│   ├── Cybersecurity.json # Cached cybersecurity articles
│   └── ...                # Other categories
└── cache-backup/          # Backup directory
```

## ⚙️ Configuration

### Cache Settings
- **Cache Expiry**: 30 minutes (configurable in `server-cache.js`)
- **Update Interval**: 1 minute (aggressive refresh for real-time updates)
- **Port**: 3001 (configurable via `PORT` environment variable)

### Environment Variables
```bash
PORT=3001  # Server port (default: 3001)
```

## 🔄 How It Works

1. **First User**: Loads feeds normally, saves to server cache
2. **Subsequent Users**: Get instant loading from server cache
3. **Background Updates**: Server refreshes cache every 1 minute for real-time updates
4. **Duplicate Detection**: Advanced duplicate detection prevents duplicate articles
5. **Cache Expiry**: Old cache is automatically cleared after 30 minutes

## 📊 Cache Statistics

The cache system tracks:
- Number of articles per category
- Duplicates removed during caching
- Cache age and expiry status
- Total cached articles
- File sizes and modification times
- Real-time update frequency (every minute)

## 🚨 Error Handling

- **Network failures**: Graceful fallback to direct feed loading
- **Cache corruption**: Automatic cache clearing and regeneration
- **Storage issues**: Error logging and recovery mechanisms

## 🔒 Security

- CORS enabled for cross-origin requests
- Input validation for all API endpoints
- Error messages don't expose sensitive information

## 📈 Performance Benefits

- **Instant loading** for new users
- **Reduced server load** from feed requests
- **Better user experience** with cached content
- **Offline resilience** with cached data

## 🛠️ Development

### Development Mode
```bash
npm run dev
```

### Testing
```bash
# Test cache status
curl http://localhost:3001/api/cache/status

# Test cache retrieval
curl http://localhost:3001/api/cache/AI
```

## 📝 Logs

The server logs:
- Cache operations (save/load/clear)
- Error messages
- Performance metrics
- Background update status

## 🔧 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3001 is available
   - Verify all dependencies are installed

2. **Cache not working**
   - Check server is running
   - Verify API endpoints are accessible
   - Check cache directory permissions

3. **Slow performance**
   - Monitor cache file sizes
   - Check server resources
   - Review update intervals

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=true npm start
```

## 📞 Support

For issues or questions about the cache server, check:
1. Server logs for error messages
2. Cache status using `npm run cache-status`
3. API endpoint responses
4. Network connectivity to the server 