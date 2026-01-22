---
name: chrome-debug
description: How to use Chrome DevTools MCP for browser debugging. Use when you need to inspect pages, take screenshots, debug UI issues, or verify visual changes.
---

# Chrome DevTools Debugging

This skill explains how to use the Chrome DevTools MCP for browser debugging and UI verification.

## Setup

Before using Chrome DevTools MCP, you must launch Chromium in headless mode with remote debugging enabled:

```bash
npm run chrome &
```

This runs Chromium with the required flags for Docker/containerized environments:

- `--remote-debugging-port=9222` - Enables MCP connection
- `--headless=new` - Runs without display (modern headless mode)
- `--no-sandbox` - Required for Docker
- `--disable-gpu` - Avoids GPU issues in containers
- `--no-first-run` - Skips first-run setup dialogs

Wait a few seconds for Chrome to start before using MCP tools.
