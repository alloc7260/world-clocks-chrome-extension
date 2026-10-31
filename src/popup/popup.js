/**
 * Popup Controller for World Clocks Extension
 * Manages:
 * - Setup clocks list rendering & live 1-second synchronized ticking
 * - Search bar with side + / red × button and dropdown list (+ to add, red × if already added)
 * - Dark / Light theme toggle
 * - Analog / Digital mode checkboxes (enforcing at least one stays selected)
 * - Responsive grid layout when only Analog mode is active
 */

(function () {
  const tzApi = window.WorldClockTimezones;
  const themesApi = window.WorldClockThemes;
  const storageApi = window.WorldClockStorage;

  const FANDOM_VAR_KEYS = ['bg', 'accent', 'hour', 'am', 'pm', 'glow'];

  // DOM Elements
  const appShell = document.getElementById('app-shell');
  const chkAnalog = document.getElementById('chk-analog');
  const chkDigital = document.getElementById('chk-digital');
  const labelAnalog = document.getElementById('label-analog');
  const labelDigital = document.getElementById('label-digital');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnSettings = document.getElementById('btn-settings');
  const btnSettingsDone = document.getElementById('btn-settings-done');
  const settingsPanel = document.getElementById('settings-panel');
  const colorThemesEl = document.getElementById('color-themes');
  const fandomThemesEl = document.getElementById('fandom-themes');
  const fontOptionsEl = document.getElementById('font-options');
  const themeActiveNameEl = document.getElementById('theme-active-name');
  const searchInput = document.getElementById('search-input');
  const btnSearchSide = document.getElementById('btn-search-side');
  const searchDropdown = document.getElementById('search-dropdown');
  const searchResultsList = document.getElementById('search-results');
  const statusToast = document.getElementById('status-toast');
  const clocksListEl = document.getElementById('clocks-list');

  let state = {
    clocks: [],
    theme: 'dark',
    palette: 'slate',
    font: 'sans',
    modes: {
      analog: true,
      digital: true
    }
  };

  let currentSearchMatches = [];
  let toastTimeoutId = null;
  let tickTimeoutId = null;

  /**
   * Checks whether a catalog entry is already in state.clocks.
   */
  function isClockAdded(entry) {
    if (!entry) return false;
    return state.clocks.some(
      (c) =>
        c.id === entry.id ||
        (c.city.toLowerCase() === entry.city.toLowerCase() &&
          c.timeZone.toLowerCase() === entry.timeZone.toLowerCase())
    );
  }

  /**
   * Shows a brief status message (e.g., when trying to uncheck the last active mode).
   */
  function showToast(message) {
    if (!statusToast) return;
    statusToast.textContent = message;
    statusToast.classList.remove('hidden');
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      statusToast.classList.add('hidden');
    }, 2200);
  }

  /**
   * Applies dark/light mode, colour or fandom theme, and clock font to the document root.
   */
  function applyTheme() {
    const root = document.documentElement;
    const fandom = themesApi.FANDOM_THEMES.find((t) => t.id === state.palette);
    const colorTheme = themesApi.COLOR_THEMES.find((t) => t.id === state.palette);
    const font =
      themesApi.FONT_OPTIONS.find((f) => f.id === state.font) || themesApi.FONT_OPTIONS[0];

    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-palette', state.palette);
    root.setAttribute('data-kind', fandom ? 'fandom' : 'color');

    for (const key of FANDOM_VAR_KEYS) {
      if (fandom && fandom[key]) {
        root.style.setProperty(`--t-${key}`, fandom[key]);
      } else {
        root.style.removeProperty(`--t-${key}`);
      }
    }

    root.style.setProperty('--font-clock', font.stack);
    root.style.setProperty('--font-scale', String(font.scale));

    const active = fandom || colorTheme;
    const modeLabel = state.theme === 'dark' ? 'Dark' : 'Light';
    themeActiveNameEl.textContent = `${active ? active.name : ''} • ${modeLabel} • ${font.name}`;

    settingsPanel.querySelectorAll('[data-option-group]').forEach((btn) => {
      const selectedId = btn.dataset.optionGroup === 'font' ? font.id : state.palette;
      const isSelected = btn.dataset.optionId === selectedId;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    });
  }

  function createOptionButton(group, id, label, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.dataset.optionGroup = group;
    btn.dataset.optionId = id;
    btn.title = label;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-checked', 'false');
    btn.addEventListener('click', async () => {
      if (group === 'font') {
        state.font = id;
      } else {
        state.palette = id;
      }
      applyTheme();
      await storageApi.saveState(state);
    });
    return btn;
  }

  function createTextSpan(className, text) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = text;
    return span;
  }

  /**
   * Renders colour themes, fandom themes, and font options into the settings panel.
   */
  function renderSettings() {
    colorThemesEl.innerHTML = '';
    fandomThemesEl.innerHTML = '';
    fontOptionsEl.innerHTML = '';

    for (const t of themesApi.COLOR_THEMES) {
      const btn = createOptionButton('palette', t.id, `${t.name} theme`, 'color-chip');
      const dot = createTextSpan('chip-dot', '');
      dot.style.background = t.swatch;
      btn.append(dot, createTextSpan('chip-name', t.name));
      colorThemesEl.appendChild(btn);
    }

    for (const t of themesApi.FANDOM_THEMES) {
      const btn = createOptionButton('palette', t.id, `${t.name} theme`, 'fandom-card');
      btn.style.setProperty('--card-bg', t.bg);
      btn.style.setProperty('--card-accent', t.accent);

      const preview = createTextSpan('fandom-preview', '');
      const time = createTextSpan('fandom-time', '10:09');
      const am = createTextSpan('fandom-ampm', 'AM');
      am.style.color = t.am;
      const pm = createTextSpan('fandom-ampm', 'PM');
      pm.style.color = t.pm;
      preview.append(time, am, pm);

      btn.append(preview, createTextSpan('fandom-name', t.name));
      fandomThemesEl.appendChild(btn);
    }

    for (const f of themesApi.FONT_OPTIONS) {
      const btn = createOptionButton('font', f.id, `${f.name} font`, 'font-chip');
      const sample = createTextSpan('font-sample', '12:45');
      sample.style.fontFamily = f.stack;
      btn.append(sample, createTextSpan('font-name', f.name));
      fontOptionsEl.appendChild(btn);
    }
  }

  function setSettingsOpen(open) {
    appShell.classList.toggle('settings-open', open);
    settingsPanel.classList.toggle('hidden', !open);
    btnSettings.classList.toggle('is-active', open);
    btnSettings.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      closeSearchDropdown();
    }
  }

  /**
   * Applies Analog / Digital mode classes and updates checkbox UI state.
   */
  function applyModes() {
    chkAnalog.checked = state.modes.analog;
    chkDigital.checked = state.modes.digital;

    // Indicate when a checkbox is the sole remaining active mode
    labelAnalog.classList.toggle('is-locked-min', state.modes.analog && !state.modes.digital);
    labelDigital.classList.toggle('is-locked-min', state.modes.digital && !state.modes.analog);

    // Toggle layout classes on #clocks-list
    const isAnalogOnly = state.modes.analog && !state.modes.digital;
    const isDigitalOnly = !state.modes.analog && state.modes.digital;

    clocksListEl.classList.toggle('analog-only-grid', isAnalogOnly);
    clocksListEl.classList.toggle('hide-analog', isDigitalOnly);
  }

  /**
   * Updates the side button next to the search bar:
   * - If the user has typed a query and the top/exact match is already added -> shows red '×'
   * - Otherwise -> shows '+'
   */
  function updateSearchSideButton() {
    const query = searchInput.value.trim();
    const topMatch = query && currentSearchMatches.length > 0 ? currentSearchMatches[0] : null;
    const glyphEl = btnSearchSide.querySelector('.side-btn-glyph');

    if (topMatch && isClockAdded(topMatch)) {
      btnSearchSide.classList.remove('is-add');
      btnSearchSide.classList.add('is-remove');
      glyphEl.textContent = '×';
      btnSearchSide.title = `Remove ${topMatch.city}`;
      btnSearchSide.setAttribute('aria-label', `Remove ${topMatch.city}`);
    } else {
      btnSearchSide.classList.remove('is-remove');
      btnSearchSide.classList.add('is-add');
      glyphEl.textContent = '+';
      btnSearchSide.title = topMatch ? `Add ${topMatch.city}` : 'Search & add clock';
      btnSearchSide.setAttribute('aria-label', topMatch ? `Add ${topMatch.city}` : 'Search & add clock');
    }
  }

  /**
   * Renders the search results dropdown list with '+' or red '×' per city.
   */
  function renderSearchDropdown() {
    const query = searchInput.value.trim();
    currentSearchMatches = tzApi.searchTimezones(query, 35);
    updateSearchSideButton();

    searchResultsList.innerHTML = '';

    if (currentSearchMatches.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'search-empty';
      emptyLi.textContent = 'No matching cities or timezones found.';
      searchResultsList.appendChild(emptyLi);
      return;
    }

    const now = new Date();
    const fragment = document.createDocumentFragment();

    for (const item of currentSearchMatches) {
      const added = isClockAdded(item);
      const meta = tzApi.getRelativeMeta(item.timeZone, now);

      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', added ? 'true' : 'false');

      const infoDiv = document.createElement('div');
      infoDiv.className = 'search-item-info';

      const citySpan = document.createElement('span');
      citySpan.className = 'search-item-city';
      citySpan.textContent = item.city;

      const subSpan = document.createElement('span');
      subSpan.className = 'search-item-sub';
      subSpan.textContent = `${item.country} • ${meta.offsetLabel}`;

      infoDiv.appendChild(citySpan);
      infoDiv.appendChild(subSpan);

      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      actionBtn.className = `search-action-btn ${added ? 'action-remove' : 'action-add'}`;
      actionBtn.textContent = added ? '×' : '+';
      actionBtn.title = added ? `Remove ${item.city}` : `Add ${item.city}`;
      actionBtn.setAttribute('aria-label', added ? `Remove ${item.city}` : `Add ${item.city}`);

      const handleToggleItem = (e) => {
        e.stopPropagation();
        toggleClockEntry(item);
      };

      actionBtn.addEventListener('click', handleToggleItem);
      li.addEventListener('click', handleToggleItem);

      li.appendChild(infoDiv);
      li.appendChild(actionBtn);
      fragment.appendChild(li);
    }

    searchResultsList.appendChild(fragment);
  }

  function openSearchDropdown() {
    renderSearchDropdown();
    searchDropdown.classList.remove('hidden');
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function closeSearchDropdown() {
    searchDropdown.classList.add('hidden');
    searchInput.setAttribute('aria-expanded', 'false');
  }

  /**
   * Adds or removes a clock entry and persists state.
   */
  async function toggleClockEntry(entry) {
    if (!entry) return;
    if (isClockAdded(entry)) {
      state.clocks = state.clocks.filter(
        (c) =>
          !(
            c.id === entry.id ||
            (c.city.toLowerCase() === entry.city.toLowerCase() &&
              c.timeZone.toLowerCase() === entry.timeZone.toLowerCase())
          )
      );
    } else {
      state.clocks.push({
        id: entry.id,
        city: entry.city,
        country: entry.country,
        timeZone: entry.timeZone
      });
    }

    await storageApi.saveState(state);
    renderClocksList();
    searchInput.value = '';
    currentSearchMatches = [];
    closeSearchDropdown();
    searchInput.blur();
    updateSearchSideButton();
  }

  /**
   * Creates the SVG element for the simple Analog Clock (Hour, Minute, Second hands).
   */
  function createAnalogClockSVG(angles) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'analog-clock');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');

    // Outer clock face
    const face = document.createElementNS(svgNS, 'circle');
    face.setAttribute('class', 'analog-face');
    face.setAttribute('cx', '50');
    face.setAttribute('cy', '50');
    face.setAttribute('r', '45');
    svg.appendChild(face);

    // 4 subtle cardinal ticks (12, 3, 6, 9)
    const ticks = [
      [50, 9, 50, 15],
      [91, 50, 85, 50],
      [50, 91, 50, 85],
      [9, 50, 15, 50]
    ];
    for (const [x1, y1, x2, y2] of ticks) {
      const tick = document.createElementNS(svgNS, 'line');
      tick.setAttribute('class', 'analog-tick');
      tick.setAttribute('x1', String(x1));
      tick.setAttribute('y1', String(y1));
      tick.setAttribute('x2', String(x2));
      tick.setAttribute('y2', String(y2));
      svg.appendChild(tick);
    }

    // Hour hand
    const hourHand = document.createElementNS(svgNS, 'line');
    hourHand.setAttribute('class', 'hand-hour');
    hourHand.setAttribute('x1', '50');
    hourHand.setAttribute('y1', '50');
    hourHand.setAttribute('x2', '50');
    hourHand.setAttribute('y2', '26');
    hourHand.style.transform = `rotate(${angles.hourDeg}deg)`;
    svg.appendChild(hourHand);

    // Minute hand
    const minuteHand = document.createElementNS(svgNS, 'line');
    minuteHand.setAttribute('class', 'hand-minute');
    minuteHand.setAttribute('x1', '50');
    minuteHand.setAttribute('y1', '50');
    minuteHand.setAttribute('x2', '50');
    minuteHand.setAttribute('y2', '17');
    minuteHand.style.transform = `rotate(${angles.minuteDeg}deg)`;
    svg.appendChild(minuteHand);

    // Second hand
    const secondHand = document.createElementNS(svgNS, 'line');
    secondHand.setAttribute('class', 'hand-second');
    secondHand.setAttribute('x1', '50');
    secondHand.setAttribute('y1', '56');
    secondHand.setAttribute('x2', '50');
    secondHand.setAttribute('y2', '14');
    secondHand.style.transform = `rotate(${angles.secondDeg}deg)`;
    svg.appendChild(secondHand);

    // Center pivot dot
    const centerDot = document.createElementNS(svgNS, 'circle');
    centerDot.setAttribute('class', 'analog-center-dot');
    centerDot.setAttribute('cx', '50');
    centerDot.setAttribute('cy', '50');
    centerDot.setAttribute('r', '3');
    svg.appendChild(centerDot);

    return svg;
  }

  /**
   * Renders the full list/grid of configured world clocks.
   */
  function renderClocksList() {
    clocksListEl.innerHTML = '';
    applyModes();

    if (state.clocks.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-clocks';
      emptyDiv.innerHTML = `
        <div class="empty-clocks-title">No clocks added yet</div>
        <div class="empty-clocks-sub">Use the search bar above and click + to add a world clock.</div>
      `;
      clocksListEl.appendChild(emptyDiv);
      return;
    }

    const now = new Date();
    const fragment = document.createDocumentFragment();

    for (const clock of state.clocks) {
      const digital = tzApi.getFormattedDigitalTime(clock.timeZone, now);
      const angles = tzApi.getClockAngles(clock.timeZone, now);
      const meta = tzApi.getRelativeMeta(clock.timeZone, now);

      const card = document.createElement('article');
      card.className = 'clock-card';
      card.dataset.clockId = clock.id;
      card.dataset.timeZone = clock.timeZone;

      // 1. LEFT: Simple Analog Clock (HMS hands)
      const analogSvg = createAnalogClockSVG(angles);

      // 2. MIDDLE: Digital Clock (00:00:00 AM/PM)
      const digitalDiv = document.createElement('div');
      digitalDiv.className = 'digital-clock';

      const hmsSpan = document.createElement('span');
      hmsSpan.className = 'digital-hms';
      hmsSpan.textContent = digital.hms;

      const periodSpan = document.createElement('span');
      periodSpan.className = `digital-period ${digital.period === 'AM' ? 'is-am' : 'is-pm'}`;
      periodSpan.textContent = digital.period;

      digitalDiv.appendChild(hmsSpan);
      digitalDiv.appendChild(periodSpan);

      // 3. RIGHT: City Info
      const metaDiv = document.createElement('div');
      metaDiv.className = 'clock-meta';

      const cityEl = document.createElement('div');
      cityEl.className = 'clock-city';
      cityEl.textContent = clock.city;
      cityEl.title = `${clock.city} (${clock.country})`;

      const subEl = document.createElement('div');
      subEl.className = 'clock-subtitle';
      subEl.textContent = meta.subtitle;

      metaDiv.appendChild(cityEl);
      metaDiv.appendChild(subEl);

      card.appendChild(analogSvg);
      card.appendChild(digitalDiv);
      card.appendChild(metaDiv);

      fragment.appendChild(card);
    }

    clocksListEl.appendChild(fragment);
  }

  /**
   * Updates all active clock cards in place every second without recreating DOM nodes.
   */
  function tickClocks() {
    const now = new Date();
    const cards = clocksListEl.querySelectorAll('.clock-card');

    cards.forEach((card) => {
      const tz = card.dataset.timeZone;
      if (!tz) return;

      const digital = tzApi.getFormattedDigitalTime(tz, now);
      const angles = tzApi.getClockAngles(tz, now);
      const meta = tzApi.getRelativeMeta(tz, now);

      const hmsEl = card.querySelector('.digital-hms');
      const periodEl = card.querySelector('.digital-period');
      const subEl = card.querySelector('.clock-subtitle');
      const hourHand = card.querySelector('.hand-hour');
      const minuteHand = card.querySelector('.hand-minute');
      const secondHand = card.querySelector('.hand-second');

      if (hmsEl && hmsEl.textContent !== digital.hms) {
        hmsEl.textContent = digital.hms;
      }
      if (periodEl && periodEl.textContent !== digital.period) {
        periodEl.textContent = digital.period;
        periodEl.classList.toggle('is-am', digital.period === 'AM');
        periodEl.classList.toggle('is-pm', digital.period === 'PM');
      }
      if (subEl && subEl.textContent !== meta.subtitle) {
        subEl.textContent = meta.subtitle;
      }
      if (hourHand) {
        hourHand.style.transform = `rotate(${angles.hourDeg}deg)`;
      }
      if (minuteHand) {
        minuteHand.style.transform = `rotate(${angles.minuteDeg}deg)`;
      }
      if (secondHand) {
        secondHand.style.transform = `rotate(${angles.secondDeg}deg)`;
      }
    });
  }

  /**
   * Schedules the next tick aligned with the system second boundary.
   */
  function startTicker() {
    if (tickTimeoutId) clearTimeout(tickTimeoutId);
    const delay = 1000 - (Date.now() % 1000);
    tickTimeoutId = setTimeout(() => {
      tickClocks();
      startTicker();
    }, delay);
  }

  /**
   * Press and hold a clock card for 1s, then drag to reorder (works in list and grid).
   */
  function initDragReorder() {
    const LONG_PRESS_MS = 1000;
    const MOVE_CANCEL_PX = 6;
    const viewport = document.getElementById('clocks-viewport');

    let pressTimer = null;
    let pendingCard = null;
    let startX = 0;
    let startY = 0;
    let drag = null;

    function cancelPress() {
      clearTimeout(pressTimer);
      pressTimer = null;
      pendingCard = null;
    }

    function startDrag() {
      const card = pendingCard;
      const rect = card.getBoundingClientRect();
      drag = { card, grabX: startX - rect.left, grabY: startY - rect.top, dx: 0, dy: 0 };
      pressTimer = null;
      pendingCard = null;
      card.classList.add('is-dragging');
    }

    // Recompute translate from the card's untransformed slot so it stays under the pointer after DOM moves.
    function positionCard(x, y) {
      const rect = drag.card.getBoundingClientRect();
      const layoutX = rect.left - drag.dx;
      const layoutY = rect.top - drag.dy;
      drag.dx = x - drag.grabX - layoutX;
      drag.dy = y - drag.grabY - layoutY;
      drag.card.style.transform = `translate(${drag.dx}px, ${drag.dy}px)`;
    }

    async function endDrag() {
      cancelPress();
      if (!drag) return;
      drag.card.classList.remove('is-dragging');
      drag.card.style.transform = '';
      drag = null;

      const order = Array.from(clocksListEl.querySelectorAll('.clock-card')).map(
        (c) => c.dataset.clockId
      );
      state.clocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      await storageApi.saveState(state);
    }

    clocksListEl.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const card = e.target.closest('.clock-card');
      if (!card) return;
      startX = e.clientX;
      startY = e.clientY;
      pendingCard = card;
      pressTimer = setTimeout(startDrag, LONG_PRESS_MS);
    });

    document.addEventListener('pointermove', (e) => {
      if (pendingCard) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_CANCEL_PX) {
          cancelPress();
        }
        return;
      }
      if (!drag) return;
      e.preventDefault();

      const under = document.elementFromPoint(e.clientX, e.clientY);
      const target = under && under.closest('.clock-card');
      if (target && target !== drag.card) {
        const cards = Array.from(clocksListEl.children);
        const movingForward = cards.indexOf(drag.card) < cards.indexOf(target);
        clocksListEl.insertBefore(drag.card, movingForward ? target.nextSibling : target);
      }

      const vr = viewport.getBoundingClientRect();
      if (e.clientY < vr.top + 24) {
        viewport.scrollTop -= 8;
      } else if (e.clientY > vr.bottom - 24) {
        viewport.scrollTop += 8;
      }

      positionCard(e.clientX, e.clientY);
    });

    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  }

  /**
   * Sets up event listeners for checkboxes, theme button, and search controls.
   */
  function bindEvents() {
    initDragReorder();

    // Analog checkbox change (enforce at least one mode selected)
    chkAnalog.addEventListener('change', async () => {
      if (!chkAnalog.checked && !state.modes.digital) {
        chkAnalog.checked = true;
        showToast('At least one clock mode must remain selected');
        return;
      }
      state.modes.analog = chkAnalog.checked;
      applyModes();
      await storageApi.saveState(state);
    });

    // Digital checkbox change (enforce at least one mode selected)
    chkDigital.addEventListener('change', async () => {
      if (!chkDigital.checked && !state.modes.analog) {
        chkDigital.checked = true;
        showToast('At least one clock mode must remain selected');
        return;
      }
      state.modes.digital = chkDigital.checked;
      applyModes();
      await storageApi.saveState(state);
    });

    // Theme toggle button
    btnThemeToggle.addEventListener('click', async () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      await storageApi.saveState(state);
    });

    btnSettings.addEventListener('click', () => {
      setSettingsOpen(settingsPanel.classList.contains('hidden'));
    });

    btnSettingsDone.addEventListener('click', () => {
      setSettingsOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !settingsPanel.classList.contains('hidden')) {
        setSettingsOpen(false);
      }
    });

    // Search input events
    searchInput.addEventListener('focus', () => {
      openSearchDropdown();
    });

    searchInput.addEventListener('input', () => {
      openSearchDropdown();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearchDropdown();
        searchInput.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentSearchMatches.length > 0) {
          toggleClockEntry(currentSearchMatches[0]);
        }
      }
    });

    // Side button (+ or red ×) next to search input
    btnSearchSide.addEventListener('click', (e) => {
      e.stopPropagation();
      const query = searchInput.value.trim();
      if (query && currentSearchMatches.length > 0) {
        toggleClockEntry(currentSearchMatches[0]);
      } else if (searchDropdown.classList.contains('hidden')) {
        searchInput.focus();
        openSearchDropdown();
      } else {
        closeSearchDropdown();
      }
    });

    // Close search dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-section')) {
        closeSearchDropdown();
      }
    });
  }

  /**
   * Initializes the extension popup.
   */
  async function init() {
    state = await storageApi.loadState();
    renderSettings();
    applyTheme();
    applyModes();
    renderClocksList();
    updateSearchSideButton();
    bindEvents();
    startTicker();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
