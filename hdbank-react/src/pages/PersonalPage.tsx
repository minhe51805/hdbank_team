import React, { useEffect, useMemo, useState } from 'react';
import { getTodo, updateTodo, checkTodo, TodoTask, TodoSummary, formatCurrency } from '../utils';

const snap = (v: number) => Math.max(0, Math.min(100, Math.round(v / 25) * 25));

const PersonalPage: React.FC = () => {
  const [planId, setPlanId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [summary, setSummary] = useState<TodoSummary>({ totalTasks: 0, completedTasks: 0, completionPct: 0, perDay: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, TodoTask[]>();
    tasks.forEach(t => {
      const k = t.date || 'Không rõ ngày';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    });
    return Array.from(map.entries());
  }, [tasks]);

  const refresh = async () => {
    const cid = Number(localStorage.getItem('customerId') || 0);
    if (!cid) { setError('Bạn chưa đăng nhập'); return; }
    setLoading(true); setError(null);
    try {
      const data = await getTodo(cid);
      setPlanId(data.planId);
      setTasks(data.tasks);
      setSummary(data.summary);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const onChangeProgress = async (t: TodoTask, value: number) => {
    if (!planId) return;
    const v = snap(value);
    setTasks(prev => prev.map(x => (x.dayIndex === t.dayIndex && x.taskIndex === t.taskIndex) ? { ...x, progress: v, status: v>=100?'done':(v>0?'in_progress':'todo') } : x));
    try {
      await updateTodo(planId, t.dayIndex, t.taskIndex, v);
      refresh();
    } catch (e) { /* silent revert could be added */ }
  };

  const onToggleDone = async (t: TodoTask, done: boolean) => {
    if (!planId) return;
    setTasks(prev => prev.map(x => (x.dayIndex === t.dayIndex && x.taskIndex === t.taskIndex) ? { ...x, progress: done?100:0, status: done?'done':'todo' } : x));
    try {
      await checkTodo(planId, t.dayIndex, t.taskIndex, done);
      refresh();
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="personal-page">
      <div className="container">
        <h1>Bảng điều khiển cá nhân</h1>
        <p>Danh sách các nhiệm vụ và tiết kiệm khi triển khai chiến dịch</p>

        {/* Summary */}
        <section className="dashboard-summary" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:20}}>
          <div style={{background:'#fff7f7',borderRadius:12,padding:16}}>
            <div style={{fontWeight:600,marginBottom:10}}>Tiến độ chiến dịch</div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:120,height:120,borderRadius:'50%',border:'12px solid #ffd2d2',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontSize:28,fontWeight:700,color:'#be1128'}}>{Math.round(summary.completionPct)}%</div>
              </div>
              <div>
                <div>Tổng nhiệm vụ: <b>{summary.totalTasks}</b></div>
                <div>Đã hoàn thành: <b>{summary.completedTasks}</b></div>
                <div style={{marginTop:6}}>Mục tiêu: <b>{summary.targetAmount!=null? formatCurrency(summary.targetAmount) : '-'}</b></div>
                <div>Đã tiết kiệm: <b>{summary.savedAmount!=null? formatCurrency(summary.savedAmount) : '-'}</b></div>
                <div>Dư địa tuần: <b>{summary.weeklyCapSave!=null? formatCurrency(summary.weeklyCapSave) : '-'}</b></div>
                <div>Gợi ý tuần: <b>{summary.recommendedWeeklySave!=null? formatCurrency(summary.recommendedWeeklySave) : '-'}</b></div>
                <div>Cần còn lại: <b>{summary.remainingAmount!=null? formatCurrency(summary.remainingAmount) : '-'}</b></div>
              </div>
            </div>
          </div>

          <div style={{background:'#fff7f7',borderRadius:12,padding:16}}>
            <div style={{fontWeight:600,marginBottom:10}}>Gợi ý từ CashyBear</div>
            <div>Hãy đặt mục tiêu nhỏ theo ngày để duy trì thói quen. 💪</div>
            <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>{
                const cid = localStorage.getItem('customerId') || '';
                const url = cid? `/explorer?customerId=${encodeURIComponent(cid)}&stage=plan_accepted` : '/explorer';
                window.open(url, '_blank');
              }} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #d0d7de',background:'#fff',cursor:'pointer'}}>View on Blockchain Explorer</button>
            </div>
          </div>
        </section>

        {/* To-Do List */}
        <section style={{marginTop:24}}>
          <div style={{fontWeight:700,marginBottom:12}}>To‑Do list</div>
          {loading && <div>Đang tải…</div>}
          {error && <div style={{color:'red'}}>⚠︎ {error}</div>}
          {!loading && !error && grouped.map(([date, items]) => (
            <div key={date} style={{background:'#fff',borderRadius:12,padding:12,marginBottom:12,border:'1px solid #f0f0f0'}}>
              <div style={{fontWeight:600,marginBottom:8}}>{date}</div>
              {items.map(it => (
                <div key={`${it.dayIndex}-${it.taskIndex}`} style={{display:'grid',gridTemplateColumns:'auto 1fr 160px 90px',alignItems:'center',gap:10,padding:'6px 0'}}>
                  <input type="checkbox" checked={it.progress>=100} onChange={e=>onToggleDone(it, e.target.checked)} />
                  <div>{it.text}</div>
                  <input type="range" min={0} max={100} step={25} value={snap(it.progress)} onChange={e=>onChangeProgress(it, Number(e.target.value))} />
                  <div style={{textAlign:'right',fontWeight:600}}>{snap(it.progress)}%</div>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PersonalPage;
