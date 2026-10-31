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
Keep track of time across the globe with a fast, clean, and distraction-free World Clocks popup right in your browser toolbar.

KEY FEATURES
• Side-by-Side Analog & Digital Clocks: View a simple HMS (Hour, Minute, Second) analog clock right next to a crisp 00:00:00 AM/PM digital clock.
• Flexible Display Modes: Toggle Analog or Digital clocks on or off independently via quick checkboxes (at least one mode always stays active).
• Responsive Analog Grid: When only Analog mode is selected, your clocks automatically arrange into a compact, responsive multi-column grid.
• Instant City & Timezone Search: Search hundreds of global cities and IANA timezones. Click "+" to add a clock or click the red "×" to remove an already-added clock.
• Dark & Light Themes: Switch seamlessly between Dark and Light modes with a single click.
• Clean Hidden-Scroll Interface: Smooth scrolling for long clock lists without cluttered scrollbars.
• 100% Offline & Private: Powered by your browser's built-in Internationalization API. No external network requests, no tracking, and zero personal data collection.
```

### Category

- **Primary Category**: `Productivity` → `Workflow & Planning` (or `Tools`)
- **Language**: `English`

---

## 2. Privacy Tab - Permission Justifications

### Single Purpose Description

```text
Displays a customizable list of world clocks across user-selected timezones in a browser toolbar popup with analog and digital display modes.
```

### Permission Justification: `storage`

```text
The "storage" permission (chrome.storage.sync) is used solely to save the user's selected world clock timezones, preferred theme (dark or light), and chosen clock display modes (analog and/or digital) across browser sessions. No personal or browsing data is accessed or transmitted.
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
| **Screenshots**                     | `1280 × 800 px` or `640 × 400 px` | Capture 2–3 screenshots showing: (1) Dark mode side-by-side Analog + Digital, (2) Light mode with search dropdown open (`+` and red `×`), (3) Analog-only responsive grid |
| **Small Promo Tile** *(Optional)* | `440 × 280 px`                       | Optional promotional tile                                                                                                                                                       |

---

## 4. Packaging & Upload Steps

1. Run `npm run validate` (or `node scripts/validate.js`) to verify all files.
2. Run `npm run pack` (or `powershell -ExecutionPolicy Bypass -File scripts/package.ps1`) to build `dist/world-clocks-extension.zip`.
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Click **New Item** and upload `dist/world-clocks-extension.zip`.
5. Fill in the **Store Listing** and **Privacy** tabs using the copy above.
6. Click **Submit for Review**.
