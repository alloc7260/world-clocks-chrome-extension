/**
 * State & Persistence Manager for World Clocks Extension.
 * Uses chrome.storage.sync with seamless fallback to localStorage for local browser testing.
 */

const STORAGE_KEY = 'world_clocks_state_v1';

function getDefaultClocks() {
  const tzApi = window.WorldClockTimezones;
  const defaults = [];
  const seenIds = new Set();

  // 1. User's local timezone
  try {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (localTz) {
      const localEntry = tzApi.findEntryByTimeZone(localTz);
      if (localEntry && !seenIds.has(localEntry.id)) {
        seenIds.add(localEntry.id);
        defaults.push(localEntry);
      }
    }
  } catch {
    // Ignore and fallback to starter clocks
  }

  // 2. Starter world clocks (UTC, New York, London, Tokyo)
  const starterZones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
  for (const tz of starterZones) {
    if (defaults.length >= 4) break;
    const entry = tzApi.findEntryByTimeZone(tz);
    if (entry && !seenIds.has(entry.id) && !defaults.some((d) => d.timeZone === entry.timeZone)) {
      seenIds.add(entry.id);
      defaults.push(entry);
    }
  }

  return defaults;
}

function getDefaultState() {
  return {
    clocks: getDefaultClocks(),
    theme: 'dark',
    palette: 'slate',
    font: 'sans',
    modes: {
      analog: true,
      digital: true
    }
  };
}

function sanitizeState(raw) {
  const fallback = getDefaultState();
  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const clocks = Array.isArray(raw.clocks)
    ? raw.clocks.filter(
        (c) =>
          c &&
          typeof c.id === 'string' &&
          typeof c.city === 'string' &&
          typeof c.timeZone === 'string'
      )
    : fallback.clocks;

  const theme = raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : fallback.theme;
  const themesApi = window.WorldClockThemes;
  const validPalette = [...themesApi.COLOR_THEMES, ...themesApi.FANDOM_THEMES].some(
    (p) => p.id === raw.palette
  );
  const palette = validPalette ? raw.palette : fallback.palette;
  const font = themesApi.FONT_OPTIONS.some((f) => f.id === raw.font) ? raw.font : fallback.font;

  let analog = raw.modes && typeof raw.modes.analog === 'boolean' ? raw.modes.analog : true;
  let digital = raw.modes && typeof raw.modes.digital === 'boolean' ? raw.modes.digital : true;

  // Enforce at least one mode is selected
  if (!analog && !digital) {
    analog = true;
    digital = true;
  }

  return {
    clocks,
    theme,
    palette,
    font,
    modes: { analog, digital }
  };
}

function hasChromeStorage() {
  return (
    typeof chrome !== 'undefined' &&
    chrome.storage &&
    chrome.storage.sync &&
    typeof chrome.storage.sync.get === 'function'
  );
}

async function loadState() {
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          resolve(getDefaultState());
          return;
        }
        if (!result || !result[STORAGE_KEY]) {
          const initial = getDefaultState();
          chrome.storage.sync.set({ [STORAGE_KEY]: initial });
          resolve(initial);
          return;
        }
        resolve(sanitizeState(result[STORAGE_KEY]));
      });
    });
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return sanitizeState(JSON.parse(raw));
  } catch {
    return getDefaultState();
  }
}

async function saveState(state) {
  const clean = sanitizeState(state);
  if (hasChromeStorage()) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: clean }, () => {
        resolve(clean);
      });
    });
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Ignore storage quota errors in restricted contexts
  }
  return clean;
}

window.WorldClockStorage = {
  loadState,
  saveState
};
