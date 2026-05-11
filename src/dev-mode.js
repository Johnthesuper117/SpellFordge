import { buildWaveSpawnPlan } from './combat.js';

export function simulateWaveSummary(wave, rng = Math.random) {
  const plan = buildWaveSpawnPlan(wave, rng);
  const counts = plan.reduce((acc, step) => {
    acc[step.kind] = (acc[step.kind] || 0) + 1;
    return acc;
  }, {});
  return {
    wave,
    totalSpawns: plan.length,
    hasMiniBoss: Boolean(counts['Troll']),
    hasBoss: Boolean(counts['Oni King']),
    counts,
    plan
  };
}
