# Password Checker Auto-Update System

## Overview
The password cracker tool now includes a plug-and-play auto-update system that automatically fetches the latest hardware benchmarks and security parameters from a remote JSON file.

## How It Works

### 1. JSON Configuration File (`pw-crack-speeds.json`)
The system reads from a JSON file containing:
- **Scenarios**: Hardware speeds for different attack scenarios
- **Hashes**: Cracking speeds for different hash algorithms
- **AI Penalty**: Entropy reduction for AI-assisted attacks
- **Update Timestamp**: When the data was last updated

### 2. Auto-Update Loader
The `pullLiveDefaults()` function:
- Fetches the JSON file on page load
- Updates scenario speeds (quantum, super, workstation, USB)
- Updates hash algorithm speeds
- Updates AI penalty values
- Falls back to baked-in defaults if fetch fails

### 3. Future-Proof Features

#### Hardware Updates
When new hardware benchmarks are released:
1. Update the `pw-crack-speeds.json` file
2. Change the `updated` timestamp
3. All instances automatically pick up new speeds

#### Quantum Roadmap Updates
When quantum computers achieve new milestones:
1. Update quantum scenario speeds in JSON
2. Add new quantum efficiency parameters
3. No code changes needed

#### Hash Algorithm Updates
When new hash algorithms are added:
1. Add new entry to `hashes` object in JSON
2. Add corresponding `<option>` to HTML
3. System automatically uses new speeds

## Configuration

### Local Development
Currently uses local file: `pw-crack-speeds.json`

### Production Deployment
Change the `remoteURL` in the JavaScript to point to your hosted JSON:

```javascript
const remoteURL = "https://raw.githubusercontent.com/your-org/pw-crack-speeds/main/latest.json";
```

### JSON Structure
```json
{
  "updated": "2025-08-01T00:00:00Z",
  "scenarios": {
    "quantum":      { "S0": 1e9,  "Tdbl": 1.5, "qeff": 1   },
    "super":        { "S0": 1e12, "Tdbl": 1.5               },
    "workstation":  { "S0": 1e10, "Tdbl": 2                 },
    "usb":          { "S0": 1e7,  "Tdbl": 3                 }
  },
  "hashes": {
    "MD5":     1.3e13,
    "SHA256":  9.0e11,
    "bcrypt":  7.0e8,
    "argon2":  8.0e4
  },
  "ai_penalty_bits": 10
}
```

## Benefits

1. **No Manual Updates**: Benchmarks update automatically
2. **Consistent Data**: All instances use same latest numbers
3. **Future-Proof**: Ready for tomorrow's hardware
4. **Graceful Fallback**: Works offline with baked-in defaults
5. **Easy Maintenance**: Update one JSON file, affects everywhere

## Deployment Options

### GitHub Raw
- Host JSON on GitHub
- Automatic CORS headers
- Version control for changes
- Easy rollback if needed

### CDN
- Use any CDN with CORS enabled
- Global distribution
- Automatic caching

### Custom Server
- Host on your own server
- Full control over updates
- Custom authentication if needed

## Example Updates

### New GPU Benchmarks (2026)
```json
{
  "scenarios": {
    "super": { "S0": 2e12, "Tdbl": 1.5 }  // RTX-6090 benchmarks
  }
}
```

### Quantum Milestone (2027)
```json
{
  "scenarios": {
    "quantum": { "S0": 5e9, "Tdbl": 1.5, "qeff": 1.2 }
  }
}
```

### New Hash Algorithm
```json
{
  "hashes": {
    "balloon512": 1.0e3
  }
}
```

## Security Considerations

- JSON file should be served over HTTPS
- Consider adding integrity checks
- Monitor for unauthorized changes
- Keep backup of working configurations

## Troubleshooting

### Auto-update fails
- Check browser console for errors
- Verify JSON file is accessible
- Ensure CORS headers are set
- Falls back to baked-in defaults

### Stale data
- Clear browser cache
- Check JSON file timestamp
- Verify network connectivity

### Performance issues
- JSON file should be small (< 1KB)
- Consider caching strategies
- Monitor fetch performance 