// Drift WritingMetrics mapping tests
// Run with: npx ts-node --esm scripts/test-metrics.mjs
import { metricsToParams } from '../lib/writingMetrics.ts';

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

console.log('\nTest 1: idle state');
const idle = metricsToParams({
  wpm: 0, wordCount: 0, avgSentenceLength: 0,
  punctuationDensity: 0, timeSinceLastKeystroke: 10000,
});
assert(idle.speed < 0.05,
  'idle speed < 0.05 (got ' + idle.speed.toFixed(3) + ')');
assert(idle.turbulence >= 0.95,
  'idle turbulence >= 0.95 (got ' + idle.turbulence.toFixed(3) + ')');
assert(idle.particleCount <= 85,
  'idle particleCount <= 85 (got ' + idle.particleCount + ')');

console.log('\nTest 2: contemplative typing');
const contemplative = metricsToParams({
  wpm: 25, wordCount: 80, avgSentenceLength: 12,
  punctuationDensity: 0.15, timeSinceLastKeystroke: 2000,
});
assert(contemplative.speed > 0.28 && contemplative.speed < 0.34,
  'contemplative speed ~0.31 (got ' + contemplative.speed.toFixed(3) + ')');
assert(contemplative.turbulence > 0.20 && contemplative.turbulence < 0.30,
  'contemplative turbulence ~0.25 (got ' + contemplative.turbulence.toFixed(3) + ')');
assert(contemplative.particleCount > 100 && contemplative.particleCount < 200,
  'contemplative particleCount 100-200 (got ' + contemplative.particleCount + ')');

console.log('\nTest 3: urgent typing');
const urgent = metricsToParams({
  wpm: 70, wordCount: 250, avgSentenceLength: 6,
  punctuationDensity: 0.08, timeSinceLastKeystroke: 150,
});
assert(urgent.speed >= 0.875,
  'urgent speed >= 0.875 (got ' + urgent.speed.toFixed(3) + ')');
assert(urgent.turbulence < 0.02,
  'urgent turbulence < 0.02 (got ' + urgent.turbulence.toFixed(3) + ')');
assert(urgent.particleCount > 300,
  'urgent particleCount > 300 (got ' + urgent.particleCount + ')');

console.log('\nTest 4: values clamped to [0,1]');
const extreme = metricsToParams({
  wpm: 999, wordCount: 9999, avgSentenceLength: 999,
  punctuationDensity: 999, timeSinceLastKeystroke: 999999,
});
assert(extreme.speed <= 1.0,      'speed clamped <= 1.0 (got ' + extreme.speed + ')');
assert(extreme.turbulence <= 1.0, 'turbulence clamped <= 1.0 (got ' + extreme.turbulence + ')');
assert(extreme.cohesion <= 1.0,   'cohesion clamped <= 1.0 (got ' + extreme.cohesion + ')');
assert(extreme.particleCount <= 400, 'particleCount clamped <= 400 (got ' + extreme.particleCount + ')');

console.log('\nTest 5: urgent vs idle are meaningfully different');
const idleAgain = metricsToParams({
  wpm: 0, wordCount: 0, avgSentenceLength: 0,
  punctuationDensity: 0, timeSinceLastKeystroke: 10000,
});
assert(urgent.speed - idleAgain.speed > 0.5,
  'urgent speed much greater than idle (diff: ' + (urgent.speed - idleAgain.speed).toFixed(2) + ')');
assert(idleAgain.turbulence - urgent.turbulence > 0.5,
  'idle turbulence much greater than urgent (diff: ' + (idleAgain.turbulence - urgent.turbulence).toFixed(2) + ')');
assert(urgent.particleCount - idleAgain.particleCount > 100,
  'urgent has many more particles (diff: ' + (urgent.particleCount - idleAgain.particleCount) + ')');

console.log('\nResults: ' + passed + ' passed, ' + failed + ' failed');
if (failed > 0) process.exit(1);
