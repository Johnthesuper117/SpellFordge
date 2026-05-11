export function getEnemyProfile(kind, wave) {
  const profiles = {
    'Goblin': { hp: 18 + wave * 2, speed: 1.6, radius: 12, color: '#10b981', damage: 6 },
    'Gremlin': { hp: 12 + wave * 1.6, speed: 2.1, radius: 10, color: '#86efac', damage: 4 },
    'Orc': { hp: 36 + wave * 4, speed: 1.1, radius: 18, color: '#ef4444', damage: 12 },
    'Troll': { hp: 180 + wave * 12, speed: 0.6, radius: 28, color: '#14532d', damage: 30 },
    'Oni King': { hp: 520 + wave * 40, speed: 1.6, radius: 36, color: '#7f1d1d', damage: 55 }
  };
  return profiles[kind] || profiles.Goblin;
}

export function chooseEnemyKind(rng = Math.random) {
  const r = rng();
  if (r < 0.55) return 'Goblin';
  if (r < 0.75) return 'Gremlin';
  return 'Orc';
}

export function buildWaveSpawnPlan(wave, rng = Math.random) {
  const base = 3 + Math.floor(wave * 1.6);
  const plan = [];

  for (let i = 0; i < base; i++) {
    const kind = chooseEnemyKind(rng);
    if (kind === 'Gremlin') {
      plan.push({ delayMs: i * 400, kind: 'Gremlin' });
      plan.push({ delayMs: i * 400 + 70, kind: 'Gremlin' });
      plan.push({ delayMs: i * 400 + 140, kind: 'Gremlin' });
    } else {
      plan.push({ delayMs: i * 400, kind });
    }
  }

  if (wave % 10 === 0) {
    plan.push({ delayMs: (base + 0.5) * 400, kind: 'Oni King' });
  } else if (wave % 5 === 0) {
    plan.push({ delayMs: (base + 0.5) * 400, kind: 'Troll' });
  }

  return plan.sort((a, b) => a.delayMs - b.delayMs);
}

export function createEnemyEntity({ kind, wave, x, y }) {
  const p = getEnemyProfile(kind, wave);
  return {
    x,
    y,
    hp: p.hp,
    maxHp: p.hp,
    speed: p.speed,
    radius: p.radius,
    color: p.color,
    damage: p.damage,
    flash: 0,
    kind,
    burn: 0,
    chill: 0,
    chainedFrom: -1
  };
}
