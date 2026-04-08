# SEO Machine

SEO Machine is a desktop application for SEO-optimized content creation. It combines powerful keyword research, competitor analysis, and content optimization tools in a single, easy-to-use interface.

## Features

### Core Features

- **Keyword Research**: Identify high-opportunity keywords with search volume, competition, and trend data
- **Competitor Analysis**: Discover content gaps where competitors rank but you do not
- **SERP Analysis**: Analyze search engine results pages to understand ranking factors
- **Topic Clusters**: Group related content ideas for comprehensive topic coverage
- **Quick Wins**: Find immediate optimization opportunities with high impact
- **Performance Matrix**: Track keyword rankings and performance over time
- **Trending Topics**: Discover trending search queries for timely content
- **Baseline Analysis**: Establish current SEO position with comprehensive data

### Desktop Integration

- **Local Data Storage**: SQLite database for projects, articles, and keywords
- **Persistent Settings**: Your preferences are saved automatically
- **Native Performance**: Built with Rust/Tauri for fast, responsive performance
- **Cross-Platform**: Available for macOS and Windows

## Installation

### macOS

1. Download the latest `.dmg` file from the releases page
2. Open the downloaded file
3. Drag `SEO Machine.app` to your Applications folder
4. Launch from Applications or Spotlight

### Windows

1. Download the latest `.msi` or `.exe` installer
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd seo

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## System Requirements

### Minimum Requirements

- **Operating System**: macOS 11+ or Windows 10+
- **Memory**: 4 GB RAM
- **Storage**: 200 MB available space
- **Display**: 1280 x 720 resolution

### Recommended Requirements

- **Operating System**: macOS 13+ or Windows 11
- **Memory**: 8 GB RAM
- **Storage**: 500 MB available space
- **Display**: 1920 x 1080 resolution

## Getting Started

### First Launch

1. Launch SEO Machine
2. Configure your API keys (if needed for premium features)
3. Set up your project workspace

### Setting Up Projects

1. Click "New Project" to create a workspace
2. Import your keywords or add them manually
3. Select research tools from the sidebar
4. View results in the main content area

### Research Workflow

1. **Baseline Analysis**: Start with `seo_baseline_analysis.py` to establish your current position
2. **Competitor Gap Research**: Run `research_competitor_gaps.py` to find opportunities
3. **Quick Wins**: Identify immediate opportunities with `research_quick_wins.py`
4. **SERP Analysis**: Analyze top-ranking content with `research_serp_analysis.py`
5. **Topic Clustering**: Group content ideas with `research_topic_clusters.py`

### API Configuration

Some features require API keys:

1. **DataForSEO API**: For comprehensive keyword and SERP data
2. **Google Search Console**: For your actual search performance
3. **Google Analytics 4**: For traffic and conversion data

Set these in your environment or the application's settings panel.

## Keyboard Shortcuts

### General

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New Project |
| `Cmd/Ctrl + O` | Open Project |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + ,` | Preferences |
| `Cmd/Ctrl + Q` | Quit |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + 1` | Research Panel |
| `Cmd/Ctrl + 2` | Projects Panel |
| `Cmd/Ctrl + 3` | Keywords Panel |
| `Cmd/Ctrl + 4` | Settings Panel |
| `Cmd/Ctrl + Tab` | Next Panel |

### Research Tools

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + R` | Run Selected Research |
| `Cmd/Ctrl + E` | Export Results |
| `Cmd/Ctrl + F` | Search Within Results |

## Troubleshooting

### Application Won't Start

**Problem**: SEO Machine fails to launch

**Solutions**:
1. Check system requirements are met
2. Re-download the installer if corrupted
3. On macOS: Right-click and "Open" if blocked by Gatekeeper
4. Check console for error messages

### Database Errors

**Problem**: "Database locked" or "Database error"

**Solutions**:
1. Close any other instances of SEO Machine
2. Restart the application
3. If persistent, delete the database file and restart (data may be lost)

### Research Scripts Not Running

**Problem**: Python research tools fail to execute

**Solutions**:
1. Ensure Python 3.10+ is installed
2. Install required Python packages: `pip install -r requirements.txt`
3. Check that `data_sources` directory exists in the application bundle
4. Verify API keys are configured correctly

### API Errors

**Problem**: "API Error" or authentication failures

**Solutions**:
1. Verify API key is valid and not expired
2. Check API usage limits have not been exceeded
3. Ensure internet connection is active
4. Review API documentation for current endpoint status

### Performance Issues

**Problem**: Application is slow or unresponsive

**Solutions**:
1. Close unused projects
2. Reduce dataset size for research queries
3. Increase available system memory
4. Update to the latest version

## Data Storage

SEO Machine stores data locally:

- **Database**: `~/.seomachine/seomachine.db` (SQLite)
- **Settings**: `~/.seomachine/settings.json`
- **Logs**: `~/.seomachine/logs/`

## Privacy

- All data is stored locally on your machine
- API keys are stored securely in local storage
- No data is sent to external servers (except via your configured APIs)

## Support

For issues and feature requests, please file a report on the project repository.

## License

Copyright 2026 SEO Machine. All rights reserved.
