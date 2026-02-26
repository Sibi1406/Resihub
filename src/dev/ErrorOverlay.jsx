import { useEffect, useState } from 'react';

export default function ErrorOverlay() {
  const [error, setError] = useState(null);

  useEffect(() => {
    function onError(evt) {
      setError({ message: evt.message || String(evt), stack: evt.error?.stack });
    }
    function onRejection(evt) {
      const reason = evt.reason || evt;
      setError({ message: reason?.message || String(reason), stack: reason?.stack });
    }
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!import.meta.env.DEV) return null;
  if (!error) return null;

  return (
    <div style={{ position: 'fixed', inset: 12, zIndex: 9999 }}>
      <div style={{ background: 'rgba(255,245,245,0.98)', border: '1px solid rgba(220,38,38,0.2)', color: '#7f1d1d', padding: 12, borderRadius: 8, boxShadow: '0 6px 28px rgba(15,23,42,0.12)' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Runtime Error</div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{error.message}</div>
        {error.stack && <pre style={{ marginTop: 8, fontSize: 12, color: '#4b5563', maxHeight: 240, overflow: 'auto' }}>{error.stack}</pre>}
      </div>
    </div>
  );
}
