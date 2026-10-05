import { useEffect, useRef, useState } from 'react';

export function useWebcam() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let activeStream;

    async function startCamera() {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (!active) {
          cameraStream.getTracks().forEach(track => track.stop());
          return;
        }

        activeStream = cameraStream;
        setStream(cameraStream);
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          await videoRef.current.play();
        }
      } catch (cameraError) {
        if (active) setError(cameraError.message || 'Unable to access the camera');
      }
    }

    startCamera();
    return () => {
      active = false;
      activeStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return { videoRef, stream, error };
}