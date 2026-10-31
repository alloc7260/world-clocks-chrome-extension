/**
 * Timezone & City Catalog and Time Calculation Utilities
 * Zero external dependencies — powered by native ECMAScript Intl API.
 */

const CURATED_CITIES = [
  { city: 'UTC', country: 'Coordinated Universal Time', timeZone: 'UTC', keywords: 'gmt zulu universal' },
  { city: 'New York', country: 'United States', timeZone: 'America/New_York', keywords: 'nyc est edt usa eastern' },
  { city: 'Los Angeles', country: 'United States', timeZone: 'America/Los_Angeles', keywords: 'la pst pdt california pacific usa' },
  { city: 'Chicago', country: 'United States', timeZone: 'America/Chicago', keywords: 'cst cdt illinois central usa' },
  { city: 'Denver', country: 'United States', timeZone: 'America/Denver', keywords: 'mst mdt colorado mountain usa' },
  { city: 'Phoenix', country: 'United States', timeZone: 'America/Phoenix', keywords: 'mst arizona usa' },
  { city: 'Anchorage', country: 'United States', timeZone: 'America/Anchorage', keywords: 'akst alaska usa' },
  { city: 'Honolulu', country: 'United States', timeZone: 'Pacific/Honolulu', keywords: 'hst hawaii usa' },
  { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', keywords: 'ontario est edt' },
  { city: 'Vancouver', country: 'Canada', timeZone: 'America/Vancouver', keywords: 'bc pst pdt' },
  { city: 'Mexico City', country: 'Mexico', timeZone: 'America/Mexico_City', keywords: 'cdmx cst' },
  { city: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', keywords: 'sao paulo brt' },
  { city: 'Buenos Aires', country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires', keywords: 'art' },
  { city: 'Santiago', country: 'Chile', timeZone: 'America/Santiago', keywords: 'clt' },
  { city: 'Bogotá', country: 'Colombia', timeZone: 'America/Bogota', keywords: 'bogota cot' },
  { city: 'Lima', country: 'Peru', timeZone: 'America/Lima', keywords: 'pet' },
  { city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', keywords: 'uk gmt bst britain england' },
  { city: 'Dublin', country: 'Ireland', timeZone: 'Europe/Dublin', keywords: 'ist gmt' },
  { city: 'Lisbon', country: 'Portugal', timeZone: 'Europe/Lisbon', keywords: 'wet west' },
  { city: 'Paris', country: 'France', timeZone: 'Europe/Paris', keywords: 'cet cest' },
  { city: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', keywords: 'cet cest frankfurt munich' },
  { city: 'Madrid', country: 'Spain', timeZone: 'Europe/Madrid', keywords: 'cet cest barcelona' },
  { city: 'Rome', country: 'Italy', timeZone: 'Europe/Rome', keywords: 'cet cest milan' },
  { city: 'Amsterdam', country: 'Netherlands', timeZone: 'Europe/Amsterdam', keywords: 'cet cest holland' },
  { city: 'Brussels', country: 'Belgium', timeZone: 'Europe/Brussels', keywords: 'cet cest' },
  { city: 'Zurich', country: 'Switzerland', timeZone: 'Europe/Zurich', keywords: 'cet cest geneva' },
  { city: 'Vienna', country: 'Austria', timeZone: 'Europe/Vienna', keywords: 'cet cest' },
  { city: 'Stockholm', country: 'Sweden', timeZone: 'Europe/Stockholm', keywords: 'cet cest' },
  { city: 'Oslo', country: 'Norway', timeZone: 'Europe/Oslo', keywords: 'cet cest' },
  { city: 'Copenhagen', country: 'Denmark', timeZone: 'Europe/Copenhagen', keywords: 'cet cest' },
  { city: 'Warsaw', country: 'Poland', timeZone: 'Europe/Warsaw', keywords: 'cet cest' },
  { city: 'Prague', country: 'Czechia', timeZone: 'Europe/Prague', keywords: 'cet cest czech' },
  { city: 'Athens', country: 'Greece', timeZone: 'Europe/Athens', keywords: 'eet eest' },
  { city: 'Helsinki', country: 'Finland', timeZone: 'Europe/Helsinki', keywords: 'eet eest' },
  { city: 'Istanbul', country: 'Turkey', timeZone: 'Europe/Istanbul', keywords: 'trt' },
  { city: 'Moscow', country: 'Russia', timeZone: 'Europe/Moscow', keywords: 'msk' },
  { city: 'Kyiv', country: 'Ukraine', timeZone: 'Europe/Kyiv', keywords: 'kiev eet eest' },
  { city: 'Cairo', country: 'Egypt', timeZone: 'Africa/Cairo', keywords: 'eet' },
  { city: 'Johannesburg', country: 'South Africa', timeZone: 'Africa/Johannesburg', keywords: 'sast cape town' },
  { city: 'Lagos', country: 'Nigeria', timeZone: 'Africa/Lagos', keywords: 'wat' },
  { city: 'Nairobi', country: 'Kenya', timeZone: 'Africa/Nairobi', keywords: 'eat' },
  { city: 'Casablanca', country: 'Morocco', timeZone: 'Africa/Casablanca', keywords: 'wet' },
  { city: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', keywords: 'uae gst abu dhabi' },
  { city: 'Riyadh', country: 'Saudi Arabia', timeZone: 'Asia/Riyadh', keywords: 'ast' },
  { city: 'Tel Aviv', country: 'Israel', timeZone: 'Asia/Jerusalem', keywords: 'jerusalem ist' },
  { city: 'Doha', country: 'Qatar', timeZone: 'Asia/Qatar', keywords: 'ast' },
  { city: 'Tehran', country: 'Iran', timeZone: 'Asia/Tehran', keywords: 'irst' },
  { city: 'Karachi', country: 'Pakistan', timeZone: 'Asia/Karachi', keywords: 'pkt islamabad lahore' },
  { city: 'Mumbai', country: 'India', timeZone: 'Asia/Kolkata', keywords: 'ist delhi bangalore bengaluru chennai hyderabad kolkata india' },
  { city: 'New Delhi', country: 'India', timeZone: 'Asia/Kolkata', keywords: 'ist india delhi' },
  { city: 'Bengaluru', country: 'India', timeZone: 'Asia/Kolkata', keywords: 'bangalore ist india' },
  { city: 'Kolkata', country: 'India', timeZone: 'Asia/Kolkata', keywords: 'calcutta ist india' },
  { city: 'Kathmandu', country: 'Nepal', timeZone: 'Asia/Kathmandu', keywords: 'npt' },
  { city: 'Dhaka', country: 'Bangladesh', timeZone: 'Asia/Dhaka', keywords: 'bst' },
  { city: 'Colombo', country: 'Sri Lanka', timeZone: 'Asia/Colombo', keywords: 'slst' },
  { city: 'Bangkok', country: 'Thailand', timeZone: 'Asia/Bangkok', keywords: 'ict' },
  { city: 'Jakarta', country: 'Indonesia', timeZone: 'Asia/Jakarta', keywords: 'wib' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', timeZone: 'Asia/Ho_Chi_Minh', keywords: 'saigon hanoi ict' },
  { city: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', keywords: 'sgt' },
  { city: 'Kuala Lumpur', country: 'Malaysia', timeZone: 'Asia/Kuala_Lumpur', keywords: 'myt' },
  { city: 'Manila', country: 'Philippines', timeZone: 'Asia/Manila', keywords: 'pht' },
  { city: 'Hong Kong', country: 'China', timeZone: 'Asia/Hong_Kong', keywords: 'hkt' },
  { city: 'Taipei', country: 'Taiwan', timeZone: 'Asia/Taipei', keywords: 'cst' },
  { city: 'Shanghai', country: 'China', timeZone: 'Asia/Shanghai', keywords: 'beijing cst shenzhen guangzhou' },
  { city: 'Beijing', country: 'China', timeZone: 'Asia/Shanghai', keywords: 'cst china' },
  { city: 'Seoul', country: 'South Korea', timeZone: 'Asia/Seoul', keywords: 'kst korea' },
  { city: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', keywords: 'jst osaka' },
  { city: 'Perth', country: 'Australia', timeZone: 'Australia/Perth', keywords: 'awst' },
  { city: 'Adelaide', country: 'Australia', timeZone: 'Australia/Adelaide', keywords: 'acst acdt' },
  { city: 'Brisbane', country: 'Australia', timeZone: 'Australia/Brisbane', keywords: 'aest' },
  { city: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney', keywords: 'aest aedt canberra' },
  { city: 'Melbourne', country: 'Australia', timeZone: 'Australia/Melbourne', keywords: 'aest aedt' },
  { city: 'Auckland', country: 'New Zealand', timeZone: 'Pacific/Auckland', keywords: 'nzst nzdt wellington' },
  { city: 'Fiji', country: 'Fiji', timeZone: 'Pacific/Fiji', keywords: 'fjt' }
];

const LEGACY_TZ_ALIASES = {
  'asia/calcutta': 'Asia/Kolkata',
  'asia/katmandu': 'Asia/Kathmandu',
  'asia/saigon': 'Asia/Ho_Chi_Minh',
  'asia/rangoon': 'Asia/Yangon',
  'europe/kiev': 'Europe/Kyiv',
  'etc/gmt': 'UTC',
  'etc/utc': 'UTC'
};

function normalizeTimeZone(tz) {
  if (!tz) return 'UTC';
  const lower = tz.toLowerCase();
  return LEGACY_TZ_ALIASES[lower] || tz;
}

function slugifyId(city, timeZone) {
  return `${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}__${timeZone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function isSupportedTimeZone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds the complete searchable catalog combining curated cities and all IANA timezones.
 */
function buildCatalog() {
  const catalog = [];
  const seenKeys = new Set();

  for (const item of CURATED_CITIES) {
    if (!isSupportedTimeZone(item.timeZone)) continue;
    const id = slugifyId(item.city, item.timeZone);
    const key = `${item.city.toLowerCase()}|${item.timeZone.toLowerCase()}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    catalog.push({
      id,
      city: item.city,
      country: item.country,
      timeZone: item.timeZone,
      searchText: `${item.city} ${item.country} ${item.timeZone} ${item.keywords || ''}`.toLowerCase()
    });
  }

  // Append remaining browser-supported IANA timezones so any valid zone can be searched and added
  if (typeof Intl.supportedValuesOf === 'function') {
    const allZones = Intl.supportedValuesOf('timeZone');
    for (const rawTz of allZones) {
      const tz = normalizeTimeZone(rawTz);
      const parts = tz.split('/');
      const rawCity = parts[parts.length - 1].replace(/_/g, ' ');
      const region = parts.length > 1 ? parts.slice(0, -1).join(' / ').replace(/_/g, ' ') : 'Global';
      const key = `${rawCity.toLowerCase()}|${tz.toLowerCase()}`;
      if (seenKeys.has(key)) continue;

      const id = slugifyId(rawCity, tz);
      seenKeys.add(key);

      catalog.push({
        id,
        city: rawCity,
        country: region,
        timeZone: tz,
        searchText: `${rawCity} ${region} ${tz} ${rawTz}`.toLowerCase()
      });
    }
  }

  return catalog;
}

const TIMEZONE_CATALOG = buildCatalog();

/**
 * Searches the timezone catalog by query string.
 * Prioritizes exact/prefix city matches, then country/zone matches.
 */
function searchTimezones(query, limit = 40) {
  const trimmed = (query || '').trim().toLowerCase();
  if (!trimmed) {
    return TIMEZONE_CATALOG.slice(0, limit);
  }

  const startsWithCity = [];
  const containsInCity = [];
  const containsInMeta = [];

  for (const entry of TIMEZONE_CATALOG) {
    const cityLower = entry.city.toLowerCase();
    if (cityLower.startsWith(trimmed)) {
      startsWithCity.push(entry);
    } else if (cityLower.includes(trimmed)) {
      containsInCity.push(entry);
    } else if (entry.searchText.includes(trimmed)) {
      containsInMeta.push(entry);
    }
  }

  return [...startsWithCity, ...containsInCity, ...containsInMeta].slice(0, limit);
}

/**
 * Resolves a default entry for a given IANA timeZone (e.g., user's local timezone).
 */
function findEntryByTimeZone(timeZone) {
  if (!timeZone) return TIMEZONE_CATALOG[0];
  const normalized = normalizeTimeZone(timeZone);
  const match = TIMEZONE_CATALOG.find(
    (item) => item.timeZone.toLowerCase() === normalized.toLowerCase()
  );
  if (match) {
    return {
      id: match.id,
      city: match.city,
      country: match.country,
      timeZone: match.timeZone
    };
  }
  const parts = normalized.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');
  const country = parts.length > 1 ? parts[0].replace(/_/g, ' ') : 'Local';
  return {
    id: slugifyId(city, normalized),
    city,
    country,
    timeZone: normalized
  };
}

/**
 * Extracts numeric date/time components in the target timezone.
 */
function getZonedParts(timeZone, now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = parseInt(part.value, 10);
    }
  }

  // Handle midnight '24' edge case in some Intl implementations
  const hour24 = map.hour === 24 ? 0 : map.hour;

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour24,
    minute: map.minute,
    second: map.second
  };
}

/**
 * Returns formatted 12-hour digital time strictly as "00:00:00 AM/PM".
 */
function getFormattedDigitalTime(timeZone, now = new Date()) {
  const { hour24, minute, second } = getZonedParts(timeZone, now);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const hh = String(hour12).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  const ss = String(second).padStart(2, '0');

  return {
    hms: `${hh}:${mm}:${ss}`,
    period,
    full: `${hh}:${mm}:${ss} ${period}`
  };
}

/**
 * Returns rotation angles (in degrees) for Hour, Minute, and Second hands.
 */
function getClockAngles(timeZone, now = new Date()) {
  const { hour24, minute, second } = getZonedParts(timeZone, now);
  const secondDeg = second * 6;
  const minuteDeg = minute * 6 + second * 0.1;
  const hourDeg = (hour24 % 12) * 30 + minute * 0.5 + second * (0.5 / 60);

  return {
    hourDeg: Number(hourDeg.toFixed(2)),
    minuteDeg: Number(minuteDeg.toFixed(2)),
    secondDeg: Number(secondDeg.toFixed(2))
  };
}

/**
 * Returns relative day ("Today", "Tomorrow", "Yesterday") and GMT offset label (e.g., "GMT+5:30").
 */
function getRelativeMeta(timeZone, now = new Date()) {
  const target = getZonedParts(timeZone, now);
  const local = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  };

  const targetUTCDate = Date.UTC(target.year, target.month - 1, target.day);
  const localUTCDate = Date.UTC(local.year, local.month - 1, local.day);
  const diffDays = Math.round((targetUTCDate - localUTCDate) / 86400000);

  let dayLabel = 'Today';
  if (diffDays === 1) dayLabel = 'Tomorrow';
  else if (diffDays === -1) dayLabel = 'Yesterday';
  else if (diffDays > 1) dayLabel = `+${diffDays}d`;
  else if (diffDays < -1) dayLabel = `${diffDays}d`;

  let offsetLabel = 'GMT';
  try {
    const offsetParts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset'
    }).formatToParts(now);
    const tzPart = offsetParts.find((p) => p.type === 'timeZoneName');
    if (tzPart && tzPart.value) {
      offsetLabel = tzPart.value === 'GMT' ? 'GMT+0' : tzPart.value;
    }
  } catch {
    offsetLabel = timeZone;
  }

  return {
    dayLabel,
    offsetLabel,
    subtitle: `${dayLabel} • ${offsetLabel}`
  };
}

window.WorldClockTimezones = {
  TIMEZONE_CATALOG,
  searchTimezones,
  findEntryByTimeZone,
  getFormattedDigitalTime,
  getClockAngles,
  getRelativeMeta
};
