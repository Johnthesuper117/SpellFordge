export const SETTINGS_STORAGE_KEY = 'soulforgeSettings';

export const defaultSettings = {
  visuals: {
    symbolMode: 'runes',
    particleLimit: 260,
    frameCap: 60
  },
  audio: {
    master: 80,
    music: 55,
    sfx: 75,
    musicEnabled: true
  },
  controls: {
    up: 'w',
    down: 's',
    left: 'a',
    right: 'd',
    secondary: ' ',
    switchSpell: 'q',
    switchSpellBack: 'e',
    pause: 'p'
  }
};

export const settings = cloneDefaults();
export const keybinds = { ...settings.controls };

let activeSettingsTab = 'visuals';
let awaitingBinding = null;
let uiHandlers = {
  openMenuScreen: () => {},
  playUiSound: () => {},
  applyAudioSettings: () => {},
  startMenuMusic: () => {},
  stopMenuMusic: () => {}
};

function cloneDefaults() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

function mergeSettings(base, incoming) {
  return {
    visuals: { ...base.visuals, ...(incoming.visuals || {}) },
    audio: { ...base.audio, ...(incoming.audio || {}) },
    controls: { ...base.controls, ...(incoming.controls || {}) }
  };
}

function bindingLabel(value) {
  if (value === ' ') return 'Space';
  if (value.toLowerCase().startsWith('arrow')) return value[0].toUpperCase() + value.slice(1);
  return value.toUpperCase();
}

export function loadSettings() {
  let loaded = cloneDefaults();

  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) loaded = mergeSettings(loaded, JSON.parse(saved));
  } catch (error) {
    console.warn('Unable to parse saved settings', error);
  }

  try {
    const legacy = localStorage.getItem('arcaneKeybinds');
    if (legacy) {
      const legacyControls = JSON.parse(legacy);
      loaded.controls = { ...loaded.controls, ...legacyControls };
    }
  } catch (error) {
    console.warn('Unable to parse legacy keybinds', error);
  }

  settings.visuals = { ...loaded.visuals };
  settings.audio = { ...loaded.audio };
  settings.controls = { ...loaded.controls };
  Object.assign(keybinds, loaded.controls);
  return settings;
}

export function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings() {
  const fresh = cloneDefaults();
  settings.visuals = { ...fresh.visuals };
  settings.audio = { ...fresh.audio };
  settings.controls = { ...fresh.controls };
  Object.assign(keybinds, fresh.controls);
  saveSettings();
  updateSettingsUi();
  uiHandlers.applyAudioSettings();
  uiHandlers.playUiSound();
}

export function setSettingsTab(tabName) {
  activeSettingsTab = tabName;
  document.querySelectorAll('[data-settings-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.settingsTab === tabName);
  });
  document.querySelectorAll('.settings-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `settings-panel-${tabName}`);
  });
}

export function updateKeybindUI() {
  const buttonMap = {
    up: 'bind-up',
    down: 'bind-down',
    left: 'bind-left',
    right: 'bind-right',
    switchSpell: 'bind-switch',
    switchSpellBack: 'bind-switch-back',
    secondary: 'bind-secondary',
    pause: 'bind-pause'
  };

  Object.entries(buttonMap).forEach(([binding, buttonId]) => {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.textContent = bindingLabel(keybinds[binding]);
    button.classList.toggle('binding', awaitingBinding === binding);
  });
}

export function updateSettingsUi() {
  const symbolMode = settings.visuals.symbolMode;
  document.getElementById('visual-symbol-mode').value = symbolMode;
  document.getElementById('visual-symbol-mode-value').textContent = symbolMode === 'off' ? 'Off' : symbolMode === 'labels' ? 'Labels' : 'Runes';
  document.getElementById('visual-particle-limit').value = settings.visuals.particleLimit;
  document.getElementById('visual-particle-limit-value').textContent = `${settings.visuals.particleLimit} particles`;
  document.getElementById('visual-frame-cap').value = settings.visuals.frameCap;
  document.getElementById('visual-frame-cap-value').textContent = `${settings.visuals.frameCap} fps`;
  document.getElementById('audio-master').value = settings.audio.master;
  document.getElementById('audio-master-value').textContent = `${settings.audio.master}%`;
  document.getElementById('audio-music').value = settings.audio.music;
  document.getElementById('audio-music-value').textContent = `${settings.audio.music}%`;
  document.getElementById('audio-sfx').value = settings.audio.sfx;
  document.getElementById('audio-sfx-value').textContent = `${settings.audio.sfx}%`;
  document.getElementById('audio-music-enabled').checked = settings.audio.musicEnabled;
  updateKeybindUI();
  setSettingsTab(activeSettingsTab);
}

export function initSettingsUI(handlers) {
  uiHandlers = { ...uiHandlers, ...handlers };
  loadSettings();
  updateSettingsUi();

  document.querySelectorAll('[data-settings-tab]').forEach(button => {
    button.addEventListener('click', () => {
      setSettingsTab(button.dataset.settingsTab);
      uiHandlers.playUiSound();
    });
  });

  document.querySelectorAll('[data-bind]').forEach(button => {
    button.addEventListener('click', () => {
      awaitingBinding = button.dataset.bind;
      updateKeybindUI();
      uiHandlers.playUiSound();
    });
  });

  document.getElementById('visual-symbol-mode').addEventListener('change', (event) => {
    settings.visuals.symbolMode = event.target.value;
    saveSettings();
    updateSettingsUi();
  });

  document.getElementById('visual-particle-limit').addEventListener('input', (event) => {
    settings.visuals.particleLimit = Number(event.target.value);
    saveSettings();
    updateSettingsUi();
  });

  document.getElementById('visual-frame-cap').addEventListener('input', (event) => {
    settings.visuals.frameCap = Number(event.target.value);
    saveSettings();
    updateSettingsUi();
  });

  document.getElementById('audio-master').addEventListener('input', (event) => {
    settings.audio.master = Number(event.target.value);
    saveSettings();
    uiHandlers.applyAudioSettings();
    updateSettingsUi();
  });

  document.getElementById('audio-music').addEventListener('input', (event) => {
    settings.audio.music = Number(event.target.value);
    saveSettings();
    uiHandlers.applyAudioSettings();
    updateSettingsUi();
  });

  document.getElementById('audio-sfx').addEventListener('input', (event) => {
    settings.audio.sfx = Number(event.target.value);
    saveSettings();
    uiHandlers.applyAudioSettings();
    updateSettingsUi();
  });

  document.getElementById('audio-music-enabled').addEventListener('change', (event) => {
    settings.audio.musicEnabled = event.target.checked;
    saveSettings();
    if (settings.audio.musicEnabled) uiHandlers.startMenuMusic();
    else uiHandlers.stopMenuMusic();
    uiHandlers.applyAudioSettings();
    updateSettingsUi();
  });

  document.getElementById('audio-test-btn').addEventListener('click', () => {
    uiHandlers.startMenuMusic();
    uiHandlers.playUiSound();
  });

  document.getElementById('audio-sfx-test-btn').addEventListener('click', () => {
    uiHandlers.playUiSound();
  });

  document.getElementById('settings-back-btn').onclick = () => {
    uiHandlers.openMenuScreen('start-screen');
    uiHandlers.playUiSound();
  };

  document.getElementById('settings-reset-btn').onclick = () => {
    resetSettings();
  };

  document.addEventListener('keydown', (event) => {
    if (!awaitingBinding) return;
    const pressed = event.key;
    if (pressed === 'Escape') {
      awaitingBinding = null;
      updateKeybindUI();
      return;
    }
    if (pressed === 'Shift' || pressed === 'Control' || pressed === 'Alt' || pressed === 'Meta') return;
    keybinds[awaitingBinding] = pressed === ' ' || pressed === 'Spacebar' ? ' ' : pressed.toLowerCase();
    settings.controls = { ...keybinds };
    saveSettings();
    awaitingBinding = null;
    updateKeybindUI();
    uiHandlers.playUiSound();
    event.preventDefault();
  });
}
