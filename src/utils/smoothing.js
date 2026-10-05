// Exponential moving average — kills keypoint jitter
export function smoothKeypoints(prev, next, alpha = 0.3) {
  if (!prev) return next;
  return next.map((kp, i) => ({
    x: alpha * kp.x + (1 - alpha) * prev[i].x,
    y: alpha * kp.y + (1 - alpha) * prev[i].y,
    v: kp.v
  }));
}