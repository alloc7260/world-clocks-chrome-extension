# Contributing & Further Development Guide

Thank you for developing and extending **World Clocks**! This guide explains the architecture, state model, and common extension points for future features.

---

## Architecture Overview

World Clocks is intentionally built with **zero runtime dependencies** using standard Web APIs and Manifest V3:

1. **`src/popup/timezones.js` (`window.WorldClockTimezones`)**
   - Combines a curated catalog of major global cities (`CURATED_CITIES`) with `Intl.supportedValuesOf('timeZone')` so every valid IANA timezone is searchable offline.
   - Provides pure helper functions:
     - `searchTimezones(query, limit)` — Ranked search across city names, countries, keywords, and IANA IDs.
     - `getFormattedDigitalTime(timeZone, now)` — Returns `{ hms, period, full }` in strict `00:00:00 AM/PM` format.
     - `getClockAngles(timeZone, now)` — Returns `{ hourDeg, minuteDeg, secondDeg }` for SVG hand rotation.
     - `getRelativeMeta(timeZone, now)` — Returns `{ dayLabel, offsetLabel, subtitle }` (e.g., `Today • GMT+5:30`).

2. **`src/popup/storage.js` (`window.WorldClockStorage`)**
   - Persists state under key `world_clocks_state_v1` in `chrome.storage.sync` (with automatic `localStorage` fallback when opening `src/popup/popup.html` directly in a browser tab during UI development).
   - State shape:
     ```json
     {
       "clocks": [
         {
           "id": "tokyo__asia-tokyo",
           "city": "Tokyo",
           "country": "Japan",
           "timeZone": "Asia/Tokyo"
         }
       ],
       "theme": "dark",
       "modes": {
         "analog": true,
         "digital": true
       }
     }
     ```

3. **`src/popup/popup.js`**
   - Renders the clock cards once when clocks are added/removed and updates only the SVG transform styles and text nodes on each 1-second tick (`tickClocks()`), avoiding layout thrashing.
   - Enforces the checkbox constraint so at least one mode (`analog` or `digital`) is always active.

---

## Common Extension Points for Future Development

### 1. Adding Custom City Aliases or Abbreviations
Edit `CURATED_CITIES` in `src/popup/timezones.js`:
```js
{ city: 'Silicon Valley', country: 'United States', timeZone: 'America/Los_Angeles', keywords: 'sjc sfo bay area pst' }
```

### 2. Customizing Themes or Adding New Color Palettes
- **Fandom themes**: add an entry to `FANDOM_THEMES` in `src/popup/themes.js` (`bg`, `accent`, `hour`, `am`, `pm`, optional `glow`). Dark/light surfaces are derived automatically in `popup.css`.
- **Colour themes**: add to `COLOR_THEMES` in `themes.js` and a matching `[data-palette]` block in `popup.css`.
- **Fonts**: add to `FONT_OPTIONS` in `themes.js` (local font stacks only — no remote fonts).

All surfaces, borders, text colors, and clock hand colors use CSS custom properties.

### 3. Adding Drag-and-Drop Clock Reordering
- In `src/popup/popup.js`, add `draggable="true"` to `.clock-card` in `renderClocksList()`.
- Handle `dragstart`, `dragover`, and `drop` to reorder `state.clocks` and call `storageApi.saveState(state)`.

### 4. Adding a Time Scrubber / Meeting Planner Mode
- Pass a custom `Date` offset into `tickClocks(customDate)` instead of `new Date()`, allowing users to drag a slider to preview future/past times across all added cities simultaneously.

---

## Testing Workflow

1. **Standalone Browser Preview**:
   - You can open `src/popup/popup.html` directly in Chrome or Edge to test UI layout, search, theme switching, and `localStorage` persistence.
2. **Chrome Extension Context**:
   - Load the root directory via `chrome://extensions` → **Load unpacked** to test `chrome.storage.sync` persistence and toolbar popup sizing.
3. **Pre-Release Validation**:
   - Run `node scripts/validate.js` and `powershell -ExecutionPolicy Bypass -File scripts/package.ps1` before uploading a new version to the Chrome Web Store.
