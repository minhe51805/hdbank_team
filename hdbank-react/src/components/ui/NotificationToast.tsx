import React, { useEffect, useRef, useState } from 'react';
import './NotificationToast.css';

type Position = 'topRight' | 'bottomRight' | 'bottomLeft';

interface Props {
  // Unique id to differentiate instances (e.g., customer_id)
  id?: string | number;
  title: string;
  lines: string[];
  timeoutMs?: number;
  onClose?: () => void;
  position?: Position;
  offsetTop?: number; // px, for topRight only
}

const NotificationToast: React.FC<Props> = ({ id, title, lines, timeoutMs = 10000, onClose, position = 'topRight', offsetTop = 84 }) => {
  const [open, setOpen] = useState(true);
  const timerRef = useRef<number | null>(null);

  // Start/Restart timer whenever identity or content changes
  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setOpen(true);
    timerRef.current = window.setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, timeoutMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, title, timeoutMs, JSON.stringify(lines)]);

  if (!open) return null;

  let style: React.CSSProperties;
  if (position === 'topRight') {
    style = { top: offsetTop, right: 16 };
  } else if (position === 'bottomLeft') {
    style = { bottom: 24, left: 16 };
  } else {
    style = { bottom: 24, right: 16 };
  }

  return (
    <div className={`promo-toast ${position}`} style={style} data-toast-id={id}
      onMouseEnter={() => { if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; } }}
      onMouseLeave={() => { if (!timerRef.current) { timerRef.current = window.setTimeout(() => { setOpen(false); onClose?.(); }, timeoutMs); } }}
    >
      <div className="promo-toast-inner">
        <div className="promo-toast-header">
          <span className="promo-toast-title">✨ {title}</span>
          <button className="promo-toast-close" onClick={() => { setOpen(false); onClose?.(); }}>×</button>
        </div>
        <div className="promo-toast-body">
          {lines.map((l, i) => (
            <div key={i} className="promo-toast-line">{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;


