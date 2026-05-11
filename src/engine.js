export function createEngine({ getFrameCap, update, draw }) {
  let started = false;
  let rafId = null;
  let lastFrameTime = 0;

  function tick(timestamp = 0) {
    const frameCap = Math.max(30, Number(getFrameCap?.() || 60));
    const frameDelay = 1000 / frameCap;
    if (timestamp - lastFrameTime >= frameDelay) {
      update();
      draw();
      lastFrameTime = timestamp;
    }
    rafId = requestAnimationFrame(tick);
  }

  return {
    start() {
      if (started) return;
      started = true;
      lastFrameTime = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop() {
      if (!started) return;
      started = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    },
    isStarted() {
      return started;
    }
  };
}
