import type { CanvasParams } from '../../types';

export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const PERCEPTION_RADIUS = 70;
const SEPARATION_RADIUS = 22;
const MAX_FORCE = 0.08;
const BASE_MIN_SPEED = 1.2;
const BASE_MAX_SPEED = 3.5;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function limit(vx: number, vy: number, max: number): [number, number] {
  const mag = Math.sqrt(vx * vx + vy * vy);
  if (mag > max && mag > 0) {
    return [(vx / mag) * max, (vy / mag) * max];
  }
  return [vx, vy];
}

export function initBoids(count: number, width: number, height: number): Boid[] {
  const boids: Boid[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = BASE_MIN_SPEED + Math.random() * (BASE_MAX_SPEED - BASE_MIN_SPEED) * 0.5;
    boids.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    });
  }
  return boids;
}

export function stepBoids(
  boids: Boid[],
  params: CanvasParams,
  width: number,
  height: number,
): Boid[] {
  const maxSpeed = BASE_MIN_SPEED + params.speed * (BASE_MAX_SPEED - BASE_MIN_SPEED);
  const separationMult = 1.0 + params.cohesion * 0.6;
  const turbulenceJitter = params.turbulence * 0.4;

  return boids.map((boid) => {
    let sepX = 0, sepY = 0;
    let aliX = 0, aliY = 0;
    let cohX = 0, cohY = 0;
    let sepCount = 0, neighborCount = 0;

    for (const other of boids) {
      if (other === boid) continue;
      const dx = other.x - boid.x;
      const dy = other.y - boid.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PERCEPTION_RADIUS && dist > 0) {
        aliX += other.vx;
        aliY += other.vy;
        cohX += other.x;
        cohY += other.y;
        neighborCount++;

        if (dist < SEPARATION_RADIUS) {
          sepX -= dx / dist;
          sepY -= dy / dist;
          sepCount++;
        }
      }
    }

    let steerX = 0, steerY = 0;

    if (neighborCount > 0) {
      // Alignment
      aliX /= neighborCount;
      aliY /= neighborCount;
      const [alx, aly] = limit(aliX - boid.vx, aliY - boid.vy, MAX_FORCE);
      steerX += alx;
      steerY += aly;

      // Cohesion
      cohX = cohX / neighborCount - boid.x;
      cohY = cohY / neighborCount - boid.y;
      const [cox, coy] = limit(cohX, cohY, MAX_FORCE);
      steerX += cox * 0.8;
      steerY += coy * 0.8;
    }

    if (sepCount > 0) {
      sepX /= sepCount;
      sepY /= sepCount;
      const [sx, sy] = limit(sepX, sepY, MAX_FORCE);
      steerX += sx * separationMult;
      steerY += sy * separationMult;
    }

    // Turbulence jitter
    if (turbulenceJitter > 0) {
      steerX += (Math.random() - 0.5) * turbulenceJitter;
      steerY += (Math.random() - 0.5) * turbulenceJitter;
    }

    let nvx = boid.vx + steerX;
    let nvy = boid.vy + steerY;
    [nvx, nvy] = limit(nvx, nvy, maxSpeed);

    // Ensure minimum speed
    const speed = Math.sqrt(nvx * nvx + nvy * nvy);
    if (speed < BASE_MIN_SPEED && speed > 0) {
      nvx = (nvx / speed) * BASE_MIN_SPEED;
      nvy = (nvy / speed) * BASE_MIN_SPEED;
    }

    // Wrap edges
    let nx = boid.x + nvx;
    let ny = boid.y + nvy;
    if (nx < 0) nx += width;
    if (nx > width) nx -= width;
    if (ny < 0) ny += height;
    if (ny > height) ny -= height;

    return { x: nx, y: ny, vx: nvx, vy: nvy };
  });
}

export function boidPath(boid: Boid): string {
  const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  const angle = Math.atan2(boid.vy, boid.vx);
  const len = 3.5 + speed * 0.7;
  const hw = 1.1;

  // Chevron/teardrop points (local space)
  const points = [
    [len, 0],
    [-len * 0.4, -hw],
    [-len * 0.15, 0],
    [-len * 0.4, hw],
  ];

  // Rotate and translate
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const transformed = points.map(([px, py]) => [
    boid.x + px * cos - py * sin,
    boid.y + px * sin + py * cos,
  ]);

  return `M ${transformed[0][0]} ${transformed[0][1]} ` +
    `L ${transformed[1][0]} ${transformed[1][1]} ` +
    `L ${transformed[2][0]} ${transformed[2][1]} ` +
    `L ${transformed[3][0]} ${transformed[3][1]} Z`;
}

export function boidColor(boid: Boid, params: CanvasParams): string {
  const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
  const maxSpeed = BASE_MIN_SPEED + params.speed * (BASE_MAX_SPEED - BASE_MIN_SPEED);
  const t = clamp((speed - BASE_MIN_SPEED) / (maxSpeed - BASE_MIN_SPEED), 0, 1);
  const r = Math.round(lerp(130, 220, t));
  const g = Math.round(lerp(120, 160, t));
  const b = Math.round(lerp(210, 90, t));
  return `rgba(${r},${g},${b},0.82)`;
}

// Resize boid population to match target count
export function resizeBoids(
  boids: Boid[],
  targetCount: number,
  width: number,
  height: number,
): Boid[] {
  if (boids.length === targetCount) return boids;
  if (boids.length < targetCount) {
    const extra = initBoids(targetCount - boids.length, width, height);
    return [...boids, ...extra];
  }
  return boids.slice(0, targetCount);
}
