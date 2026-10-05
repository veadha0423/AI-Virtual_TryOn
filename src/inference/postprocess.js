// Parse [1,56,8400] → 17 keypoints {x,y,v} (normalized 0-1)
export function postprocess(rawData, confThreshold = 0.5) {
  const N = 8400;
  let best = -1, bestConf = confThreshold;

  for (let i = 0; i < N; i++) {
    const c = rawData[4 * N + i];
    if (c > bestConf) { bestConf = c; best = i; }
  }
  if (best === -1) return null;

  const kps = [];
  for (let k = 0; k < 17; k++) {
    kps.push({
      x: rawData[(5 + k * 3) * N + best] / 640,
      y: rawData[(5 + k * 3 + 1) * N + best] / 640,
      v: rawData[(5 + k * 3 + 2) * N + best]
    });
  }
  return kps;
}