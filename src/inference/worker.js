// Web Worker — inference runs off main thread
import * as ort from 'onnxruntime-web';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url';
import wasmModuleUrl from 'onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs?url';

let session = null;

self.onmessage = async (e) => {
  try {
    if (e.data.type === 'init') {
      ort.env.wasm.wasmPaths = {
        'ort-wasm-simd-threaded.jsep.wasm': wasmUrl,
        'ort-wasm-simd-threaded.jsep.mjs': wasmModuleUrl
      };
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      session = await ort.InferenceSession.create(e.data.modelUrl, {
        executionProviders: ['wasm']
      });
      self.postMessage({ type: 'ready' });
      return;
    }

    if (e.data.type === 'infer') {
      if (!session) throw new Error('Inference session is not initialized');
      const tensor = new ort.Tensor('float32', e.data.data, [1, 3, 640, 640]);
      const out = await session.run({ images: tensor });
      self.postMessage(
        { type: 'result', data: out.output0.data.buffer },
        [out.output0.data.buffer]
      );
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
};