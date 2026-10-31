/**
 * Theme & Font Catalog for World Clocks.
 * - COLOR_THEMES: simple palettes, hand-tuned in popup.css via [data-palette].
 * - FANDOM_THEMES: pop-culture inspired palettes; their colors are injected as --t-* CSS
 *   variables and popup.css derives dark/light surfaces from them.
 * - FONT_OPTIONS: local system font stacks only (no remote font loading).
 */

const COLOR_THEMES = [
  { id: 'slate', name: 'Slate', swatch: '#38bdf8' },
  { id: 'ocean', name: 'Ocean', swatch: '#06b6d4' },
  { id: 'emerald', name: 'Emerald', swatch: '#10b981' },
  { id: 'sunset', name: 'Sunset', swatch: '#f97316' },
  { id: 'violet', name: 'Violet', swatch: '#a855f7' },
  { id: 'rose', name: 'Rose', swatch: '#f43f5e' },
  { id: 'cyber', name: 'Lime', swatch: '#84cc16' },
  { id: 'nord', name: 'Nordic', swatch: '#60a5fa' },
  { id: 'espresso', name: 'Espresso', swatch: '#eab308' }
];

// Names are intentionally generic ("inspired by") to stay clear of trademarked brands.
const FANDOM_THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk', bg: '#0a0a12', accent: '#fcee0a', hour: '#00f0ff', am: '#fcee0a', pm: '#ff2a6d', glow: '#00f0ff' },
  { id: 'black-pink', name: 'Black Pink', bg: '#0b0b0f', accent: '#ff4fa3', hour: '#ffffff', am: '#ffc2dd', pm: '#ff2d95', glow: '#ff4fa3' },
  { id: 'pocket-trainer', name: 'Pocket Trainer', bg: '#161a2b', accent: '#ffcb05', hour: '#ffffff', am: '#ffcb05', pm: '#ff3b3b' },
  { id: 'superhero', name: 'Superhero', bg: '#160607', accent: '#ec1d24', hour: '#f5c518', am: '#f5c518', pm: '#ff5252' },
  { id: 'spider-hero', name: 'Spider Hero', bg: '#0b1530', accent: '#e23636', hour: '#ffffff', am: '#ff6b6b', pm: '#4c8dff' },
  { id: 'vigilante', name: 'Vigilante', bg: '#0c0c0e', accent: '#ffd600', hour: '#e0e0e0', am: '#ffd600', pm: '#9ea7b3' },
  { id: 'hacker', name: 'Hacker', bg: '#010a03', accent: '#00ff41', hour: '#b8ffc8', am: '#00ff41', pm: '#00d4ff', glow: '#00ff41' },
  { id: 'synthwave', name: 'Synthwave', bg: '#1a0b2e', accent: '#ff6ec7', hour: '#ffffff', am: '#ffb347', pm: '#8c9bff', glow: '#ff6ec7' },
  { id: 'galaxy', name: 'Galaxy', bg: '#0b0d26', accent: '#8b5cf6', hour: '#e0e7ff', am: '#60a5fa', pm: '#f472b6' },
  { id: 'halloween', name: 'Halloween', bg: '#120a14', accent: '#ff7518', hour: '#f5f5f5', am: '#ff7518', pm: '#b06cff' },
  { id: 'shinobi', name: 'Shinobi', bg: '#1b1410', accent: '#ff7f11', hour: '#ffffff', am: '#ff9f43', pm: '#2e9bff' },
  { id: 'dracula', name: 'Dracula', bg: '#282a36', accent: '#bd93f9', hour: '#f8f8f2', am: '#f1fa8c', pm: '#ff79c6' }
];

// scale normalizes visual width so 00:00:00 AM fits the card across fonts.
const FONT_OPTIONS = [
  { id: 'sans', name: 'Sans', stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif', scale: 1 },
  { id: 'rounded', name: 'Rounded', stack: 'ui-rounded, "SF Pro Rounded", Nunito, "Varela Round", "Arial Rounded MT Bold", "Segoe UI", sans-serif', scale: 1 },
  { id: 'condensed', name: 'Condensed', stack: 'Bahnschrift, "DIN Alternate", "Roboto Condensed", "Arial Narrow", sans-serif', scale: 1.06 },
  { id: 'mono', name: 'Mono', stack: 'ui-monospace, "Cascadia Code", "SF Mono", Consolas, Menlo, monospace', scale: 0.9 },
  { id: 'serif', name: 'Serif', stack: '"Iowan Old Style", Georgia, "Times New Roman", serif', scale: 1 },
  { id: 'typewriter', name: 'Typewriter', stack: '"Courier New", Courier, monospace', scale: 0.88 },
  { id: 'display', name: 'Display', stack: 'Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", sans-serif', scale: 1.04 },
  { id: 'handwritten', name: 'Handwritten', stack: '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive', scale: 0.88 }
];

window.WorldClockThemes = {
  COLOR_THEMES,
  FANDOM_THEMES,
  FONT_OPTIONS
};
