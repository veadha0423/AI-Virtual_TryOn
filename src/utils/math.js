import { normalizedToWorld } from './coords';

// Shoulder midpoint + width + tilt — anchors garment
export function shoulderMetrics(kps, aspect, camZ = 5) {
  const L = normalizedToWorld(1 - kps[5].x, kps[5].y, aspect, camZ);
  const R = normalizedToWorld(1 - kps[6].x, kps[6].y, aspect, camZ);
  return {
    center: { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 },
    width: Math.hypot(R.x - L.x, R.y - L.y),
    angle: Math.atan2(R.y - L.y, R.x - L.x)
  };
}