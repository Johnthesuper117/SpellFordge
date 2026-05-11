import assert from 'node:assert/strict';
import { simulateWaveSummary } from './dev-mode.js';

function seededRng(seed = 1337) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const wave4 = simulateWaveSummary(4, seededRng(1));
assert.equal(wave4.hasMiniBoss, false, 'Wave 4 should not have a mini-boss');
assert.equal(wave4.hasBoss, false, 'Wave 4 should not have a boss');

const wave5 = simulateWaveSummary(5, seededRng(2));
assert.equal(wave5.hasMiniBoss, true, 'Wave 5 should include Troll mini-boss');
assert.equal(wave5.hasBoss, false, 'Wave 5 should not include Oni King boss');

const wave10 = simulateWaveSummary(10, seededRng(3));
assert.equal(wave10.hasBoss, true, 'Wave 10 should include Oni King boss');
assert.equal(wave10.hasMiniBoss, false, 'Wave 10 should prioritize boss over mini-boss');

console.log('dev-mode combat spawn tests passed');
