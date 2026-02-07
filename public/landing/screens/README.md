# Landing Page Screenshots

This directory contains screenshots of the post-login UI pages used on the landing page.

## Required Files

The landing page expects the following screenshot files (both light and dark variants):

- `dashboard-light.png`, `dashboard-dark.png`
- `projects-light.png`, `projects-dark.png`
- `workspace-light.png`, `workspace-dark.png`
- `calendar-light.png`, `calendar-dark.png`
- `resources-light.png`, `resources-dark.png`
- `lists-light.png`, `lists-dark.png`

## Generating Screenshots

Use the automated screenshot capture script:

```bash
WMA_BASE_URL=http://localhost:5173 \
WMA_EMAIL=your-email@example.com \
WMA_PASSWORD=your-password \
node scripts/capture-landing-screenshots.mjs
```

### Prerequisites

1. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

2. Ensure the app is running locally (or set `WMA_BASE_URL` to your deployed URL)

3. Have valid login credentials ready

### Environment Variables

- `WMA_BASE_URL` (optional, default: `http://localhost:5173`) - Base URL of the app
- `WMA_EMAIL` (required) - Login email address
- `WMA_PASSWORD` (required) - Login password

### Screenshot Specifications

- Viewport size: 1400x900 pixels
- Format: PNG
- Color scheme: Captured in both light and dark modes
- Full page: No (viewport only for consistent sizing)

### Manual Screenshots

If you prefer to capture screenshots manually:

1. Log into the app
2. Navigate to each page:
   - `/home` → `dashboard-{theme}.png`
   - `/projects` → `projects-{theme}.png`
   - `/projects/{id}` → `workspace-{theme}.png`
   - `/work?view=calendar` → `calendar-{theme}.png`
   - `/library` → `resources-{theme}.png`
   - `/lists` → `lists-{theme}.png`
3. Capture at 1400x900 viewport
4. Toggle dark mode and capture again
5. Save files with the naming convention above
