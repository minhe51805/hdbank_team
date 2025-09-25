import React, { useEffect, useState } from 'react';

interface Props {
  serverBase?: string; // e.g. http://127.0.0.1:8011
}

const ZaloQuickSpendTrigger: React.FC<Props> = ({ serverBase = 'http://127.0.0.1:8011' }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState<{ chat_id?: string; user_id?: string; user_name?: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Fetch last chat target to show hint
    fetch(`${serverBase}/last_chat_target`).then(r => r.json()).then(setTarget).catch(() => {});
  }, [serverBase]);

  const submit = async () => {
    if (!amount.trim()) { setMsg('Vui lòng nhập số tiền.'); return; }
    if (!target?.chat_id) { setMsg('Chưa có chat gần đây. Hãy nhắn "alo" cho bot Zalo trước.'); return; }
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`${serverBase}/trigger/spend`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount, note, chat_id: target?.chat_id })
      });
      const data = await res.json();
      if (data?.ok) {
        setMsg('Đã gửi qua Zalo thành công.');
        setAmount(''); setNote(''); setOpen(false);
      } else {
        setMsg(data?.error || 'Gửi thất bại. Hãy nhắn trước cho bot Zalo để lấy chat_id.');
      }
    } catch (e: any) {
      setMsg(e?.message || 'Lỗi kết nối server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 24, zIndex: 9999 }}>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ padding: '10px 14px', borderRadius: 8, background: '#007bff', color: '#fff', border: 0, cursor: 'pointer' }}>
          Gửi chi tiêu → Zalo
        </button>
      )}
      {open && (
        <div style={{ width: 320, padding: 16, borderRadius: 12, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Gửi chi tiêu sang Zalo</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 0, fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            {target?.chat_id ? (
              <span>Chat gần nhất: {target.user_name || target.user_id} ({target.chat_id})</span>
            ) : (
              <span>Chưa có chat gần đây. Hãy nhắn "alo" cho bot Zalo trước.</span>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Số tiền (VND)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="vd: 150000" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Ghi chú (tuỳ chọn)</label>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="vd: ăn trưa" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }} />
          </div>
          {msg && <div style={{ marginTop: 10, fontSize: 12, color: '#c00' }}>{msg}</div>}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setOpen(false)} style={{ padding: '8px 12px', borderRadius: 8, background: '#eee', border: 0, cursor: 'pointer' }}>Đóng</button>
            <button onClick={submit} disabled={busy || !target?.chat_id} style={{ padding: '8px 12px', borderRadius: 8, background: (busy || !target?.chat_id) ? '#8bb6ff' : '#007bff', color: '#fff', border: 0, cursor: 'pointer' }}>
              {busy ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZaloQuickSpendTrigger;


