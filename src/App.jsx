import { useEffect, useState } from 'react';
import { useWebcam } from './hooks/useWebcam';
import { useInference } from './hooks/useInference';
import TryOnScene from './components/TryOnScene';
import StatusBar from './components/StatusBar';
import './App.css';

export default function App() {
  const { videoRef, stream, error: cameraError } = useWebcam();
  const { keypoints, error: inferenceError } = useInference(videoRef, 30);
  const error = cameraError || inferenceError;
  const [fps, setFps] = useState(0);

  // FPS counter
  useEffect(() => {
    let frames = 0, last = performance.now();
    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(frames); frames = 0; last = now;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div className="studio-shell">
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Fitting studio home">
          <span className="wordmark-icon" aria-hidden="true">F</span>
          <span>FORM<span className="wordmark-divider">/</span>FIT</span>
        </a>
        <div className="masthead-meta">
          <span className="local-badge"><span />LOCAL SESSION</span>
          <StatusBar fps={fps} ready={!!keypoints} error={error} />
        </div>
      </header>

      <main id="top" className="studio-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">VIRTUAL FITTING ROOM <span> / 01</span></p>
            <h1>Try-on studio</h1>
          </div>
          <p className="heading-note">Live camera <span>→</span> virtual fit</p>
        </div>

        <section className="preview-grid" aria-label="Camera and virtual try-on previews">
          <article className="preview-panel">
            <div className="panel-heading">
              <div className="panel-title"><span className="panel-index">01</span><h2>Live camera</h2></div>
              <span className="panel-label">INPUT</span>
            </div>
            <div className="preview-frame camera-frame">
              <video
                ref={videoRef}
                className="camera-video"
                playsInline
                muted
                aria-label="Live camera feed"
              />
              <div className="frame-corners" aria-hidden="true">
                <span /><span /><span /><span />
              </div>
              <div className="frame-readout"><span>CAM 01</span><span>640 × 480</span></div>
            </div>
            <div className="panel-footnote"><span className="footnote-dot" />Camera preview</div>
          </article>

          <article className="preview-panel">
            <div className="panel-heading">
              <div className="panel-title"><span className="panel-index">02</span><h2>Virtual try-on</h2></div>
              <span className="panel-label">PREVIEW</span>
            </div>
            <div className="preview-frame tryon-frame">
              <TryOnScene keypoints={keypoints} stream={stream} />
              {!keypoints && (
                <div className="scene-waiting">
                  <span className="target-mark" aria-hidden="true"><i /><i /></span>
                  <p>{error ? 'Preview unavailable' : 'Waiting for a subject'}</p>
                  <span>{error || 'Stand in view of the camera to begin'}</span>
                </div>
              )}
              <div className="frame-readout"><span>FIT 01</span><span>{keypoints ? 'TRACKING' : 'STANDBY'}</span></div>
            </div>
            <div className="panel-footnote"><span className="footnote-dot" />Garment preview</div>
          </article>
        </section>

        <footer className="studio-footer">
          <span>FORM / FIT STUDIO</span>
          <span>PROCESSING ON THIS DEVICE</span>
        </footer>
      </main>
    </div>
  );
}