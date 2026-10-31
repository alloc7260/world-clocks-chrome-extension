/**
 * Extension Validator Script
 * Verifies manifest.json, required icons, and popup assets exist before publishing.
 *
 * Usage: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const requiredFiles = [
  'manifest.json',
  'src/popup/popup.html',
  'src/popup/popup.css',
  'src/popup/popup.js',
  'src/popup/timezones.js',
  'src/popup/themes.js',
  'src/popup/storage.js',
  'assets/icons/icon.svg',
  'assets/icons/icon-16.png',
  'assets/icons/icon-32.png',
  'assets/icons/icon-48.png',
  'assets/icons/icon-128.png'
];

let hasErrors = false;

for (const relPath of requiredFiles) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[MISSING] ${relPath}`);
    hasErrors = true;
  }
}

try {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  if (manifest.manifest_version !== 3) {
    console.error('[INVALID] manifest_version must be 3');
    hasErrors = true;
  }
  if (!manifest.action || !manifest.action.default_popup) {
    console.error('[INVALID] action.default_popup is required');
    hasErrors = true;
  }
  // Chrome Web Store upload limits.
  if (!manifest.description || manifest.description.length > 132) {
    console.error(`[INVALID] description must be 1-132 chars (got ${(manifest.description || '').length})`);
    hasErrors = true;
  }
  if (!manifest.name || manifest.name.length > 75) {
    console.error(`[INVALID] name must be 1-75 chars (got ${(manifest.name || '').length})`);
    hasErrors = true;
  }
  if (manifest.short_name && manifest.short_name.length > 12) {
    console.error(`[INVALID] short_name must be <= 12 chars (got ${manifest.short_name.length})`);
    hasErrors = true;
  }
  console.log(`Validated Manifest V3: "${manifest.name}" v${manifest.version}`);
} catch (err) {
  console.error(`[ERROR] Failed to parse manifest.json: ${err.message}`);
  hasErrors = true;
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('All extension files and manifest checks passed.');
}
