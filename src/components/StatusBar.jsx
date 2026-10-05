export default function StatusBar({ fps, ready, error }) {
  const status = error ? 'ERROR' : ready ? 'TRACKING' : 'STANDBY';

  return (
    <div className="system-status" title={error || undefined}>
      <span className={`status-dot${error ? ' is-error' : ready ? ' is-live' : ''}`} />
      <span>{status}</span>
      <span className="status-separator" />
      <span className="status-fps"><strong>{fps}</strong><small>FPS</small></span>
    </div>
  );
}