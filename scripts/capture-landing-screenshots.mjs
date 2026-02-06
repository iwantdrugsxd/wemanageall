#!/usr/bin/env node
/**
 * Landing Page Screenshot Capture Script
 * 
 * Captures screenshots of post-login UI pages for use on the landing page.
 * 
 * Usage:
 *   WMA_BASE_URL=http://localhost:5173 WMA_EMAIL=user@example.com WMA_PASSWORD=password node scripts/capture-landing-screenshots.mjs
 * 
 * Environment Variables:
 *   WMA_BASE_URL - Base URL of the app (default: http://localhost:5173)
 *   WMA_EMAIL - Login email
 *   WMA_PASSWORD - Login password
 */

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const screensDir = join(projectRoot, 'public', 'landing', 'screens');

const BASE_URL = process.env.WMA_BASE_URL || 'http://localhost:5173';
const EMAIL = process.env.WMA_EMAIL;
const PASSWORD = process.env.WMA_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('❌ Error: WMA_EMAIL and WMA_PASSWORD environment variables are required');
  console.error('   Example: WMA_EMAIL=user@example.com WMA_PASSWORD=password node scripts/capture-landing-screenshots.mjs');
  process.exit(1);
}

// Ensure screens directory exists
if (!existsSync(screensDir)) {
  await mkdir(screensDir, { recursive: true });
}

const routes = [
  { path: '/home', name: 'dashboard' },
  { path: '/projects', name: 'projects' },
  { path: '/work?view=calendar', name: 'calendar' },
  { path: '/library', name: 'resources' },
  { path: '/lists', name: 'lists' }
];

// For workspace, we'll need to get a project ID first
let workspacePath = null;

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Output: ${screensDir}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    colorScheme: 'light'
  });
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📝 Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Fill login form
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    await page.fill('input[type="password"], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    
    // Wait for navigation after login
    await page.waitForURL(/^\/(home|dashboard|projects)/, { timeout: 10000 });
    await page.waitForTimeout(2000); // Wait for UI to settle
    
    console.log('✅ Logged in successfully\n');

    // Step 2: Get project ID for workspace screenshot
    console.log('🔍 Finding project for workspace screenshot...');
    try {
      await page.goto(`${BASE_URL}/projects`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      // Try to find first project link or ID
      const projectLink = await page.$('a[href*="/projects/"]');
      if (projectLink) {
        const href = await projectLink.getAttribute('href');
        const projectId = href.match(/\/projects\/(\d+)/)?.[1];
        if (projectId) {
          workspacePath = `/projects/${projectId}`;
          console.log(`   Found project ID: ${projectId}\n`);
        }
      }
    } catch (e) {
      console.log('   ⚠️  Could not find project, skipping workspace screenshot\n');
    }

    // Step 3: Capture screenshots in light mode
    console.log('📸 Capturing light mode screenshots...');
    for (const route of routes) {
      try {
        console.log(`   ${route.name}...`);
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000); // Wait for content to load
        
        const screenshotPath = join(screensDir, `${route.name}-light.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false // Viewport only
        });
        console.log(`   ✅ Saved: ${route.name}-light.png`);
      } catch (e) {
        console.error(`   ❌ Failed to capture ${route.name}: ${e.message}`);
      }
    }

    // Capture workspace if we found a project
    if (workspacePath) {
      try {
        console.log(`   workspace...`);
        await page.goto(`${BASE_URL}${workspacePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const screenshotPath = join(screensDir, 'workspace-light.png');
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false
        });
        console.log(`   ✅ Saved: workspace-light.png`);
      } catch (e) {
        console.error(`   ❌ Failed to capture workspace: ${e.message}`);
      }
    }

    // Step 4: Switch to dark mode and capture again
    console.log('\n🌙 Switching to dark mode...');
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Toggle dark mode in the app (if there's a toggle button)
    try {
      const themeToggle = await page.$('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]');
      if (themeToggle) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // Theme toggle might not be accessible, continue anyway
    }

    console.log('📸 Capturing dark mode screenshots...');
    for (const route of routes) {
      try {
        console.log(`   ${route.name}...`);
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const screenshotPath = join(screensDir, `${route.name}-dark.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false
        });
        console.log(`   ✅ Saved: ${route.name}-dark.png`);
      } catch (e) {
        console.error(`   ❌ Failed to capture ${route.name}: ${e.message}`);
      }
    }

    if (workspacePath) {
      try {
        console.log(`   workspace...`);
        await page.goto(`${BASE_URL}${workspacePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        const screenshotPath = join(screensDir, 'workspace-dark.png');
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: false
        });
        console.log(`   ✅ Saved: workspace-dark.png`);
      } catch (e) {
        console.error(`   ❌ Failed to capture workspace: ${e.message}`);
      }
    }

    console.log('\n✅ Screenshot capture complete!');
    console.log(`   Screenshots saved to: ${screensDir}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
