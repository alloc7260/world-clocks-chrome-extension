# Chrome Web Store Listing & Submission Guide

Use this document to copy and paste fields directly into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 1. Store Listing Copy

### Extension Title (Max 75 characters)

```text
World Clocks - Minimal Analog & Digital Timezones
```

### Short Summary / Description (Max 132 characters)

```text
Minimal world clocks: analog & digital side by side, city search, themes, fonts, and dark/light modes.
```

### Detailed Description

```text
Keep track of time across the globe with a fast, clean, distraction-free world clock popup right in your browser toolbar.

KEY FEATURES
• Analog + Digital, Side by Side: A simple hour/minute/second analog clock next to a large 00:00:00 AM/PM digital time, with the city name and day/UTC offset (e.g. "Tomorrow • GMT+9").
• Flexible Display Modes: Turn Analog or Digital on or off with quick checkboxes (at least one always stays on).
• Responsive Analog Grid: Show only analog clocks and they arrange into a compact multi-column grid.
• Instant City & Timezone Search: Search hundreds of cities and every IANA timezone. Click "+" to add, or the red "×" to remove a clock you already have.
• Drag to Reorder: Press and hold a clock for one second, then drag it into place.
• 21 Themes: 9 clean colour themes plus 12 bold styles like Cyberpunk, Synthwave, Hacker, Galaxy, Halloween, and Dracula.
• Dark & Light Modes: Every theme works in both, switched with one click.
• 8 Clock Fonts: Sans, Rounded, Condensed, Mono, Serif, Typewriter, Display, and Handwritten.
• Distinct AM / PM Colours: Tell morning from evening at a glance.
• Clean, Hidden-Scroll Interface: Long lists scroll smoothly without visible scrollbars.
• 100% Offline & Private: Uses your browser's built-in time zone data. No network requests, no tracking, no data collection.

Your clocks, theme, font, and display settings are saved and synced with your Chrome profile.
```

### Category

- **Category**: `Productivity` → `Workflow & Planning` (alternative: `Productivity` → `Tools`)
- **Language**: `English (United States)`

---

## 2. Privacy Tab - Permission Justifications

### Single Purpose Description

```text
Displays a customizable list of world clocks across user-selected timezones in a browser toolbar popup with analog and digital display modes.
```

### Permission Justification: `storage`

```text
The "storage" permission (chrome.storage.sync) is used solely to save the user's selected world clock cities and their order, dark/light mode, colour theme, clock font, and display modes (analog and/or digital) across browser sessions. No personal or browsing data is accessed or transmitted.
```

### Remote Code

- **Are you using remote code?** Select **No, I am not using remote code**.

### Data Usage Certification

- Uncheck all data collection boxes (this extension collects **no** user data).
- Check all three certification checkboxes confirming compliance with Chrome Web Store Developer Program Policies.

---

## 3. Graphic Assets Checklist

| Asset                                     | Dimensions                              | Status / Location                                                                                                                                                               |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Store Icon**                      | `128 × 128 px` (PNG)                 | Included at `assets/icons/icon-128.png`                                                                                                                                       |
| **Toolbar Icons**                   | `16`, `32`, `48 px` (PNG)         | Included at `assets/icons/icon-{16,32,48}.png`                                                                                                                                |
| **Screenshots**                     | `1280 × 800 px` JPEG (24-bit, no alpha) | `store-assets/screenshot-1.jpeg` (dark list + light analog grid), `store-assets/screenshot-2.jpeg` (Cyberpunk theme + Appearance panel). Regenerate with `npm run screenshots`. |
| **Small Promo Tile** *(Optional)* | `440 × 280 px`                       | Optional promotional tile                                                                                                                                                       |

---

## 4. Packaging & Upload Steps

1. Run `npm run validate` (or `node scripts/validate.js`) to verify all files.
2. Run `npm run pack` (or `powershell -ExecutionPolicy Bypass -File scripts/package.ps1`) to build `dist/world-clocks-extension.zip`.
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Click **New Item** and upload `dist/world-clocks-extension.zip`.
5. Fill in the **Store Listing** and **Privacy** tabs using the copy above.
6. Click **Submit for Review**.
