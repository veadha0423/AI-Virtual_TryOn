import { useEffect, useRef, useState } from 'react';
import { preprocess } from '../inference/preprocess';
import { postprocess } from '../inference/postprocess';

// Runs inference in a worker at ~30Hz — decoupled from 60Hz render loop
export function useInference(videoRef, hz = 30) {
  const [keypoints, setKeypoints] = useState(null);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const canvasRef = useRef(null);
  const readyRef = useRef(false);
  const inFlightRef = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    // Offscreen canvas for preprocessing
    const c = document.createElement('canvas');
    c.width = c.height = 640;
    canvasRef.current = c;

    // Spin up worker
    const worker = new Worker(
      new URL('../inference/worker.js', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === 'ready') {
        readyRef.current = true;
      } else if (e.data.type === 'result') {
        inFlightRef.current = false;
        setKeypoints(postprocess(new Float32Array(e.data.data)));
      } else if (e.data.type === 'error') {
        failedRef.current = true;
        inFlightRef.current = false;
        setError(e.data.message);
      }
    };
    worker.onerror = (event) => {
      failedRef.current = true;
      setError(event.message || 'Inference worker failed');
    };
    worker.postMessage({ type: 'init', modelUrl: '/best.onnx' });

    // Inference loop (Hz-driven, NOT 60Hz)
    const timer = setInterval(() => {
      if (!readyRef.current || failedRef.current || inFlightRef.current ||
          !videoRef.current || !canvasRef.current) {
            // console.log(1);
            return
           };
      const tensor = preprocess(videoRef.current, canvasRef.current);
      inFlightRef.current = true;
      worker.postMessage(
        { type: 'infer', data: tensor.data },
        [tensor.data.buffer]   // zero-copy
      );
    }, 1000 / hz);

    return () => {
      clearInterval(timer);
      readyRef.current = false;
      inFlightRef.current = false;
      failedRef.current = false;
      worker.terminate();
    };
  }, [videoRef, hz]);

  return { keypoints, error };
}