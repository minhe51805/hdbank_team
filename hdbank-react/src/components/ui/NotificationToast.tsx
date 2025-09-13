import React, { useEffect, useRef, useState } from 'react';
import './NotificationToast.css';

type Position = 'topRight' | 'bottomRight';

interface Props {
  title: string;
  lines: string[];
  timeoutMs?: number;
  onClose?: () => void;
  position?: Position;
  offsetTop?: number; // px, for topRight only
}

const NotificationToast: React.FC<Props> = ({ title, lines, timeoutMs = 10000, onClose, position = 'topRight', offsetTop = 84 }) => {
  const [open, setOpen] = useState(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, timeoutMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeoutMs, onClose]);

  if (!open) return null;

  const style: React.CSSProperties = position === 'topRight' ? { top: offsetTop, right: 16 } : { bottom: 24, right: 16 };

  return (
    <div className={`promo-toast ${position}`} style={style}
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


