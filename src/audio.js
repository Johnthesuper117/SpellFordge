export function createAudioController(getAudioSettings) {
  const state = {
    context: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    active: false,
    musicTimer: null,
    musicStep: 0
  };

  function ensureAudio() {
    if (state.context) return state;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    state.context = new AudioContextCtor();
    state.masterGain = state.context.createGain();
    state.musicGain = state.context.createGain();
    state.sfxGain = state.context.createGain();
    state.musicGain.connect(state.masterGain);
    state.sfxGain.connect(state.masterGain);
    state.masterGain.connect(state.context.destination);
    return state;
  }

  function applyAudioSettings() {
    const engine = ensureAudio();
    if (!engine) return;
    const audioSettings = getAudioSettings();
    engine.masterGain.gain.value = audioSettings.master / 100;
    engine.musicGain.gain.value = audioSettings.music / 100;
    engine.sfxGain.gain.value = audioSettings.sfx / 100;
    if (!audioSettings.musicEnabled) stopMenuMusic();
  }

  function triggerTone(frequency, duration = 0.14, waveform = 'sine', gain = 0.08, isMusic = false) {
    const engine = ensureAudio();
    if (!engine) return;
    if (engine.context.state === 'suspended') engine.context.resume();

    const oscillator = engine.context.createOscillator();
    const envelope = engine.context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillator.connect(envelope);
    envelope.connect(isMusic ? engine.musicGain : engine.sfxGain);

    const now = engine.context.currentTime;
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), now + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  function playUiSound() {
    triggerTone(698.46, 0.08, 'triangle', 0.05, false);
  }

  function startMenuMusic() {
    const engine = ensureAudio();
    if (!engine) return;
    const audioSettings = getAudioSettings();
    if (!audioSettings.musicEnabled) return;
    if (engine.context.state === 'suspended') engine.context.resume();
    if (engine.active) return;

    const palette = [261.63, 329.63, 392, 523.25, 466.16, 392];
    const tick = () => {
      if (!state.active || !getAudioSettings().musicEnabled) return;
      const root = palette[state.musicStep % palette.length];
      triggerTone(root, 1.35, 'sine', 0.035, true);
      triggerTone(root * 0.5, 1.35, 'triangle', 0.012, true);
      state.musicStep += 1;
    };

    state.active = true;
    state.musicStep = 0;
    tick();
    state.musicTimer = window.setInterval(tick, 1650);
  }

  function stopMenuMusic() {
    if (!state.active) return;
    clearInterval(state.musicTimer);
    state.musicTimer = null;
    state.active = false;
  }

  return {
    state,
    ensureAudio,
    applyAudioSettings,
    triggerTone,
    playUiSound,
    startMenuMusic,
    stopMenuMusic
  };
}
