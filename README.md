

<div align="center">

<img src="assets/icon.png" alt="CloudLeaf" width="128" height="128">

# CloudLeaf

**Browser Bookmark Cloud Sync Extension**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/knpkebnhpcbklnknkcpgkiochlimhcoi?label=Chrome)](https://chrome.google.com/webstore/detail/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![Edge Add-ons](https://img.shields.io/badge/Edge-Supported-blue.svg)](https://microsoftedge.microsoft.com/addons/detail/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![Mozilla Add-ons](https://img.shields.io/amo/v/cloudleaf?label=Firefox)](https://addons.mozilla.org/zh-CN/firefox/addon/cloudleaf/)
![Chrome Web Store Size](https://img.shields.io/chrome-web-store/size/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![Plasmo](https://img.shields.io/badge/Built%20with-Plasmo-blue)](https://docs.plasmo.com/)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ccf2c7a6d3c44c16b90100c80e8f7ba7)](https://app.codacy.com/gh/CloudLeaf-Studio/CloudLeaf/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[English](README.md) | [中文](README_zh.md)

</div>

---

## Features

- **Cross-Browser Support** - Fully supports Chrome, Edge, and Firefox
- **Upload to GitHub Gist** - Sync bookmarks to your private Gist
- **Upload via WebDAV** - Sync bookmarks to any WebDAV-compatible cloud storage (Jianguoyun, etc.)
- **Export to Local File** - Download bookmarks as JSON file
- **Import from Cloud/Local** - Restore bookmarks from Gist, WebDAV, or local file
- **Automatic Bookmark Sync** - After one successful manual upload or download, enable Auto Sync to synchronize future changes; conflicts require manual resolution ([usage guide](https://cloudleaf.yingluan.cc/guides/usage))
- **Conflict Detection** - Prevent accidental overwrites when cloud is newer
- **Preview Mode** - View cloud bookmarks before importing

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev          # For Chrome
npm run dev:edge     # For Microsoft Edge
npm run dev:firefox  # For Firefox

# Build for production
npm run build          # For Chrome
npm run build:edge     # For Microsoft Edge
npm run build:firefox  # For Firefox

# Package for store
npm run package          # For Chrome
npm run package:edge     # For Microsoft Edge
npm run package:firefox  # For Firefox
```

## Supported Providers

| Provider            | Protocol | Status    |
| ------------------- | -------- | --------- |
| GitHub Gist         | REST API | Supported |
| Jianguoyun          | WebDAV   | Supported |
| Custom WebDAV       | WebDAV   | Supported |

## Configuration

### GitHub Gist

1. Create a GitHub [Personal Access Token](https://github.com/settings/tokens) with `gist` scope
2. Create a new Gist (can be private)
3. Enter your token and Gist ID in the extension settings

The storage filename defaults to `CloudLeaf.json`.

### WebDAV (Nutstore)

1. Go to Nutstore → Account Info → Security Options → Third-party Apps
2. Add a new app to get the **app password** (not your login password)
3. Enter your email and app password in the extension settings
