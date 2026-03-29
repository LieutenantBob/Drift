// Drift boid engine unit tests
// Run with: npx ts-node --esm scripts/test-boids.mjs
import { initBoids, stepBoids } from '../lib/themes/murmuration.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  PASS:', message);
    passed++;
  } else {
    console.error('  FAIL:', message);
    failed++;
  }
}

const W = 390;
const H = 844;

const defaultParams = {
  particleCount: 80,
  speed: 0.5,
  colourTemperature: 0.5,
  cohesion: 0.5,
  turbulence: 0.0,
};

console.log('\nTest 1: initBoids count and bounds');
const boids = initBoids(80, W, H);
assert(boids.length === 80, 'initBoids returns 80 boids');
assert(boids.every(b => b.x >= 0 && b.x <= W), 'all x within width');
assert(boids.every(b => b.y >= 0 && b.y <= H), 'all y within height');
assert(boids.every(b => typeof b.vx === 'number'), 'all boids have vx');
assert(boids.every(b => typeof b.vy === 'number'), 'all boids have vy');

console.log('\nTest 2: stepBoids moves boids');
const after = stepBoids([...boids], defaultParams, W, H);
const anyMoved = after.some((b, i) =>
  Math.abs(b.x - boids[i].x) > 0.001 ||
  Math.abs(b.y - boids[i].y) > 0.001
);
assert(anyMoved, 'at least one boid moved after step');

console.log('\nTest 3: speed param affects velocity magnitude');
const slowParams = { ...defaultParams, speed: 0.0 };
const fastParams = { ...defaultParams, speed: 1.0 };
const freshBoids = initBoids(20, W, H);
const slowBoids = stepBoids([...freshBoids], slowParams, W, H);
const fastBoids = stepBoids([...freshBoids], fastParams, W, H);
const avgSlow = slowBoids.reduce((s, b) =>
  s + Math.sqrt(b.vx * b.vx + b.vy * b.vy), 0) / slowBoids.length;
const avgFast = fastBoids.reduce((s, b) =>
  s + Math.sqrt(b.vx * b.vx + b.vy * b.vy), 0) / fastBoids.length;
assert(avgFast > avgSlow,
  'fast speed (' + avgFast.toFixed(2) + ') > slow speed (' + avgSlow.toFixed(2) + ')');

console.log('\nTest 4: turbulence param changes behaviour');
const calmParams  = { ...defaultParams, turbulence: 0.0 };
const stormParams = { ...defaultParams, turbulence: 1.0 };
const base = initBoids(40, W, H);
const calm  = stepBoids([...base], calmParams,  W, H);
const storm = stepBoids([...base], stormParams, W, H);
const diffCount = calm.filter((b, i) =>
  Math.abs(b.vx - storm[i].vx) > 0.001 ||
  Math.abs(b.vy - storm[i].vy) > 0.001
).length;
assert(diffCount > 0, 'turbulence changes velocity (' + diffCount + ' boids differ)');

console.log('\nTest 5: boids stay near canvas bounds after 100 steps');
let testBoids = initBoids(20, W, H);
for (let i = 0; i < 100; i++) {
  testBoids = stepBoids(testBoids, defaultParams, W, H);
}
const allNearBounds = testBoids.every(b =>
  b.x >= -10 && b.x <= W + 10 &&
  b.y >= -10 && b.y <= H + 10
);
assert(allNearBounds, 'boids remain near canvas after 100 steps');

console.log('\nResults: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
