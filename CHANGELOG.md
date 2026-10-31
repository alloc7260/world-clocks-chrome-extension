# Changelog

All notable changes to the **World Clocks** Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-31

### Added
- Appearance panel (palette button in header) with 9 colour themes, 12 fandom-inspired themes (Cyberpunk, Black Pink, Pocket Trainer, Superhero, Spider Hero, Vigilante, Hacker, Synthwave, Galaxy, Halloween, Shinobi, Dracula), and 8 clock fonts.
- Distinct AM and PM colours per theme.
- `src/popup/themes.js` catalog for themes and fonts.

### Changed
- Clock card layout: analog left, digital middle, city right; larger digital time with less whitespace.
- Search closes and clears automatically after adding/removing a clock.
- Minimum Chrome version raised to 111 (CSS `color-mix`).

### Removed
- Red `×` on clock cards (removal is now done from search results only).

## [1.0.0] - 2026-10-31

### Added
- Initial Manifest V3 Chrome Extension release.
- Popup world clock list with synchronized 1-second updates.
- City and IANA timezone search bar with side `+` button to add clocks and red `×` icon when a clock is already added.
- Side-by-side simple Analog clock (Hour, Minute, Second hands) and Digital clock (`00:00:00 AM/PM`) with relative day and GMT offset subtitle.
- Analog and Digital mode checkboxes with guardrail ensuring at least one mode remains selected.
- Automatic responsive multi-column grid layout when only Analog mode is active.
- Dark and Light theme toggle button with persistent state via `chrome.storage.sync`.
- Hidden scrollbars on both the main clock list and search results dropdown.
- Icon generator (`scripts/generate-icons.js`), validator (`scripts/validate.js`), and Chrome Web Store ZIP packager (`scripts/package.ps1`).
- Chrome Web Store listing guide (`docs/STORE_LISTING.md`) and privacy policy (`docs/PRIVACY_POLICY.md`).
