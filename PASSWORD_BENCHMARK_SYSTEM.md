# 🔐 Password Cracking Benchmark Update System

This system automatically updates password cracking benchmarks daily with real-world statistics from various sources, ensuring your password security tools always use the most current data.

## 🚀 Features

- **Daily Automatic Updates**: Runs every day at 2 AM UTC via GitHub Actions
- **Real-World Data Sources**: Integrates with Hashcat benchmarks, quantum computing progress, and supercomputer capabilities
- **Hardware Trend Analysis**: Applies Moore's Law and hardware improvement trends
- **Backup System**: Automatically backs up previous versions before updates
- **Validation**: Ensures data integrity and format consistency
- **Logging**: Tracks all updates and changes for audit purposes

## 📊 Data Sources

### Hashcat Benchmarks
- **RTX 4090**: Latest GPU benchmarks from Hashcat community
- **RTX 4080**: High-end desktop GPU performance
- **RTX 3090**: Previous generation benchmarks
- **Source**: https://hashcat.net/forum/thread-10253.html

### Quantum Computing Progress
- **IBM Quantum**: Latest logical qubit counts and error rates
- **Google Quantum**: Quantum supremacy achievements
- **Source**: IBM Quantum Computing, Google AI Blog

### Supercomputer Capabilities
- **Frontier**: World's fastest supercomputer (1 PH/s theoretical)
- **Fugaku**: Japanese supercomputer benchmarks
- **Source**: TOP500.org, SPEC.org

## 🔧 Installation & Setup

### 1. Prerequisites
```bash
# Ensure Node.js 16+ is installed
node --version

# Install dependencies
npm install
```

### 2. Manual Update
```bash
# Run the benchmark updater manually
npm run update

# Or directly
node update-password-benchmarks.js
```

### 3. Validate Current Data
```bash
# Check if current benchmarks are valid
npm run validate
```

## 🤖 Automated Updates

### GitHub Actions Workflow
The system uses GitHub Actions to automatically update benchmarks daily:

- **Schedule**: Runs every day at 2 AM UTC
- **Trigger**: Can also be triggered manually via GitHub UI
- **Commit**: Automatically commits updated data to repository
- **Backup**: Creates timestamped backups of previous versions
- **Logging**: Maintains detailed logs of all updates

### Workflow File
Located at: `.github/workflows/update-benchmarks.yml`

### Manual Trigger
1. Go to GitHub repository
2. Navigate to "Actions" tab
3. Select "Update Password Cracking Benchmarks"
4. Click "Run workflow"

## 📁 File Structure

```
├── update-password-benchmarks.js    # Main updater script
├── pw-crack-speeds.json             # Current benchmark data
├── benchmark-backups/               # Backup directory
│   └── benchmarks-YYYY-MM-DD.json  # Timestamped backups
├── benchmark-updates.log            # Update history log
├── .github/workflows/
│   └── update-benchmarks.yml       # GitHub Actions workflow
└── package.json                     # Node.js dependencies
```

## 📈 Benchmark Data Format

### Current Structure
```json
{
  "updated": "2025-01-15T02:00:00.000Z",
  "scenarios": {
    "quantum": {
      "S0": 1100000000,
      "Tdbl": 1.5,
      "qeff": 1
    },
    "super": {
      "S0": 1100000000000,
      "Tdbl": 1.5
    },
    "workstation": {
      "S0": 11000000000,
      "Tdbl": 2.0
    },
    "usb": {
      "S0": 11000000,
      "Tdbl": 3.0
    }
  },
  "hashes": {
    "MD5": 14300000000000,
    "SHA256": 990000000000,
    "bcrypt": 770000000,
    "argon2": 88000
  },
  "ai_penalty_bits": 10,
  "metadata": {
    "last_update": "2025-01-15T02:00:00.000Z",
    "improvement_factor": 1.1,
    "days_since_last_update": 1,
    "sources": ["hashcat", "quantum", "supercomputer"],
    "notes": "Updated with real-world benchmark data and hardware improvement trends"
  }
}
```

## 🔄 Update Process

### 1. Data Collection
- Fetches latest benchmarks from multiple sources
- Applies hardware improvement trends
- Calculates time-based improvements

### 2. Validation
- Ensures all required fields are present
- Validates data types and ranges
- Checks for consistency

### 3. Backup
- Creates timestamped backup of current data
- Stores in `benchmark-backups/` directory

### 4. Update
- Writes new data to `pw-crack-speeds.json`
- Logs update details
- Commits changes to repository

## 📊 Hardware Improvement Trends

### Annual Improvement Rates
- **Quantum Computers**: 10% improvement (faster than Moore's Law)
- **Supercomputers**: 10% improvement
- **Desktop GPUs**: 10% improvement (Moore's Law)
- **USB Crackers**: 5% improvement (slower market)

### Doubling Periods
- **Quantum**: 1.5 years
- **Super**: 1.5 years  
- **Workstation**: 2.0 years
- **USB**: 3.0 years

## 🛠️ Customization

### Adding New Data Sources
1. Update `BENCHMARK_SOURCES` in `update-password-benchmarks.js`
2. Add new API endpoints or data sources
3. Update the `fetchLatestBenchmarks()` method

### Modifying Update Frequency
1. Edit the cron schedule in `.github/workflows/update-benchmarks.yml`
2. Change `cron: '0 2 * * *'` to your desired frequency

### Adding New Hash Algorithms
1. Add to `requiredHashes` array in validation
2. Update benchmark data structure
3. Add to data sources

## 🔍 Monitoring & Troubleshooting

### Check Update Status
```bash
# View recent update logs
tail -f benchmark-updates.log

# Check last update time
npm run validate
```

### Manual Update
```bash
# Force update regardless of last update time
node update-password-benchmarks.js
```

### GitHub Actions Issues
1. Check Actions tab in GitHub repository
2. Review workflow logs for errors
3. Verify file permissions and dependencies

## 📋 Log Format

Each log entry contains:
```json
{
  "timestamp": "2025-01-15T02:00:00.000Z",
  "action": "benchmark_update",
  "old_data": {
    "updated": "2025-01-14T02:00:00.000Z",
    "scenarios": ["quantum", "super", "workstation", "usb"],
    "hashes": ["MD5", "SHA256", "bcrypt", "argon2"]
  },
  "new_data": {
    "updated": "2025-01-15T02:00:00.000Z",
    "scenarios": ["quantum", "super", "workstation", "usb"],
    "hashes": ["MD5", "SHA256", "bcrypt", "argon2"],
    "improvement_factor": 1.1
  }
}
```

## 🔐 Security Considerations

- **Data Integrity**: All updates are validated before application
- **Backup System**: Previous versions are always preserved
- **Audit Trail**: Complete logging of all changes
- **Source Verification**: Data comes from reputable sources
- **Rate Limiting**: Respects API rate limits from data sources

## 🌐 Integration with Password Tools

The updated benchmarks are automatically used by:
- **Password Checker**: `password-checker.html`
- **Advanced Entropy Calculator**: `advanced-entropy-simulator.html`
- **Entropy Calculator**: `entropy-calculator.html`

All tools fetch the latest data on page load via the `pullLiveDefaults()` function.

## 📞 Support

For issues with the benchmark update system:
1. Check the GitHub Actions logs
2. Review the `benchmark-updates.log` file
3. Create an issue in the repository
4. Verify the JSON file format is valid

---

**Last Updated**: 2025-01-15  
**Next Scheduled Update**: 2025-01-16 02:00 UTC  
**System Status**: ✅ Active 