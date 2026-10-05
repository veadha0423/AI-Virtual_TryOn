import * as ort from 'onnxruntime-web';

// Video frame → [1,3,640,640] float32 tensor
export function preprocess(video, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, 640, 640);
  const { data } = ctx.getImageData(0, 0, 640, 640);

  const f32 = new Float32Array(3 * 640 * 640);
  for (let i = 0; i < 640 * 640; i++) {
    f32[i]                   = data[i * 4]     / 255;
    f32[640 * 640 + i]       = data[i * 4 + 1] / 255;
    f32[2 * 640 * 640 + i]   = data[i * 4 + 2] / 255;
  }
  return new ort.Tensor('float32', f32, [1, 3, 640, 640]);
}