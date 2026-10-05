// Custom math: normalized image coords → Three.js world space
export function normalizedToWorld(nx, ny, aspect, camZ = 5, fovDeg = 45) {
  const worldH = 2 * Math.tan((fovDeg * Math.PI / 180) / 2) * camZ;
  const worldW = worldH * aspect;
  return {
    x: (nx - 0.5) * worldW,
    y: -(ny - 0.5) * worldH   // screen Y↓ → world Y↑
  };
}