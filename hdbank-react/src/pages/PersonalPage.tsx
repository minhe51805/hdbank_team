import React, { useEffect, useMemo, useState } from 'react';
import { getTodo, updateTodo, checkTodo, TodoTask, TodoSummary, formatCurrency } from '../utils';
import PlanUpdateNotification from '../components/ui/PlanUpdateNotification';
import './PersonalPage.css';

const snap = (v: number) => Math.max(0, Math.min(100, Math.round(v / 25) * 25));

const PersonalPage: React.FC = () => {
  const [planId, setPlanId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [summary, setSummary] = useState<TodoSummary>({ totalTasks: 0, completedTasks: 0, completionPct: 0, perDay: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, TodoTask[]>();
    tasks.forEach(t => {
      const k = t.date || 'Không rõ ngày';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    });
    return Array.from(map.entries());
  }, [tasks]);

  // Preview list for summary card – show a few incomplete tasks
  const previewTasks = useMemo(() => {
    const incomplete = tasks.filter(t => (t.progress ?? 0) < 100);
    return incomplete.slice(0, 4);
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

  useEffect(() => {
    refresh();
    
    // Listen for plan updates from chatbot
    const handlePlanUpdate = (event: CustomEvent) => {
      console.log('Plan updated, refreshing dashboard...', event.detail);
      setShowNotification(true);
      setTimeout(() => refresh(), 1000); // Small delay to ensure backend is updated
    };

    window.addEventListener('planUpdated', handlePlanUpdate as EventListener);
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate as EventListener);
    };
  }, []);

  const onChangeProgress = async (t: TodoTask, value: number) => {
    if (!planId) return;
    const v = snap(value);
    setTasks(prev => {
      const updated = prev.map(x => (x.dayIndex === t.dayIndex && x.taskIndex === t.taskIndex)
        ? { ...x, progress: v, status: v >= 100 ? 'done' : (v > 0 ? 'in_progress' : 'todo') }
        : x);
      // Update summary locally to avoid page jump/reload feeling
      const total = updated.length;
      const completed = updated.filter(x => (x.progress ?? 0) >= 100).length;
      const pct = total ? (completed / total) * 100 : 0;
      setSummary(s => ({ ...s, totalTasks: total, completedTasks: completed, completionPct: pct }));
      return updated;
    });
    try {
      await updateTodo(planId, t.dayIndex, t.taskIndex, v);
    } catch (e) { /* silent revert could be added */ }
  };

  const onToggleDone = async (t: TodoTask, done: boolean) => {
    if (!planId) return;
    setTasks(prev => {
      const updated = prev.map(x => (x.dayIndex === t.dayIndex && x.taskIndex === t.taskIndex)
        ? { ...x, progress: done ? 100 : 0, status: done ? 'done' : 'todo' }
        : x);
      // Update summary locally for smoother UX
      const total = updated.length;
      const completed = updated.filter(x => (x.progress ?? 0) >= 100).length;
      const pct = total ? (completed / total) * 100 : 0;
      setSummary(s => ({ ...s, totalTasks: total, completedTasks: completed, completionPct: pct }));
      return updated;
    });
    try {
      await checkTodo(planId, t.dayIndex, t.taskIndex, done);
    } catch (e) { /* ignore */ }
  };

  const progressAngle = (summary.completionPct / 100) * 360;

  const scrollToPlanSection = () => {
    const el = document.querySelector('.todo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="personal-page">
      <div className="container">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Bảng điều khiển cá nhân</h1>
          <p className="dashboard-subtitle">Quản lý mục tiêu tài chính và theo dõi tiến độ hoàn thành nhiệm vụ hàng ngày</p>
        </header>

        {/* KPI strip */}
        <section className="kpi-strip">
          <div className="kpi">
            <div className="kpi-label">Mục tiêu</div>
            <div className="kpi-value">{summary.targetAmount != null ? formatCurrency(summary.targetAmount) : '-'}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Đã tiết kiệm</div>
            <div className="kpi-value success">{summary.savedAmount != null ? formatCurrency(summary.savedAmount) : '-'}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Còn thiếu</div>
            <div className="kpi-value warning">{summary.remainingAmount != null ? formatCurrency(summary.remainingAmount) : '-'}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Hoàn thành</div>
            <div className="kpi-value primary">{Math.round(summary.completionPct)}%</div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="dashboard-summary">
          {/* Progress Card */}
          <div className="progress-card">
            <div className="card-title">Tiến độ chiến dịch</div>
            <div className="progress-content">
              <div 
                className="progress-circle"
                style={{ '--progress-angle': `${progressAngle}deg` } as React.CSSProperties}
              >
                <div className="progress-percentage">
                  {Math.round(summary.completionPct)}%
                </div>
              </div>
              <div className="progress-stats">
                <div className="stat-row">
                  <span className="stat-label">Tổng nhiệm vụ</span>
                  <span className="stat-value">{summary.totalTasks}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Đã hoàn thành</span>
                  <span className="stat-value highlight">{summary.completedTasks}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Mục tiêu</span>
                  <span className="stat-value">{summary.targetAmount != null ? formatCurrency(summary.targetAmount) : '-'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Đã tiết kiệm</span>
                  <span className="stat-value highlight">{summary.savedAmount != null ? formatCurrency(summary.savedAmount) : '-'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Dư địa tuần</span>
                  <span className="stat-value">{summary.weeklyCapSave != null ? formatCurrency(summary.weeklyCapSave) : '-'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Gợi ý tuần</span>
                  <span className="stat-value">{summary.recommendedWeeklySave != null ? formatCurrency(summary.recommendedWeeklySave) : '-'}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Còn cần lại</span>
                  <span className="stat-value">{summary.remainingAmount != null ? formatCurrency(summary.remainingAmount) : '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* To‑Do preview Card */}
          <div className="todo-card">
            <div className="card-title">To‑Do list</div>
            <div className="todo-preview-list">
              {previewTasks.length === 0 && (
                <div className="todo-empty">Chưa có nhiệm vụ. Hãy bắt đầu bằng việc đặt mục tiêu nhỏ.</div>
              )}
              {previewTasks.map(it => (
                <div key={`${it.dayIndex}-${it.taskIndex}`} className="todo-preview-item">
                  <div className="dot"></div>
                  <div className="text">{it.text}</div>
                  <div className="mini-progress">
                    <div className="mini-progress-fill" style={{ width: `${snap(it.progress)}%` }}></div>
                  </div>
                  <div className="pct">{snap(it.progress)}%</div>
                </div>
              ))}
            </div>
            <button className="view-all-btn" onClick={scrollToPlanSection}>Xem tất cả</button>
          </div>

          {/* CashyBear Card */}
          <div className="cashybear-card">
            <div className="card-title">Gợi ý từ CashyBear</div>
            <p className="cashybear-message">
              Hãy đặt mục tiêu nhỏ theo ngày để duy trì thói quen. Mỗi bước nhỏ sẽ đưa bạn đến thành công lớn! 💪✨
            </p>
            <div className="cashybear-actions">
              <button
                className="primary-action"
                onClick={() => {
                  const cid = localStorage.getItem('customerId') || '';
                  const url = cid
                    ? `/explorer?customerId=${encodeURIComponent(cid)}&stage=plan_accepted`
                    : '/explorer';
                  window.open(url, '_blank');
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" fill="currentColor"/>
                  <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/>
                </svg>
                <span>View on Blockchain Explorer</span>
              </button>
            </div>
          </div>
        </section>

        {/* To-Do List */}
        <section className="todo-section">
          <div className="todo-header">
            <h2 className="todo-title">Kế hoạch hành động</h2>
          </div>
          
          {loading && (
            <div className="loading-state">
              <div>⏳ Đang tải danh sách nhiệm vụ...</div>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <strong>⚠️ Có lỗi xảy ra:</strong> {error}
            </div>
          )}
          
          {!loading && !error && grouped.length === 0 && (
            <div className="loading-state">
              <div>🎯 Chưa có nhiệm vụ nào. Hãy bắt đầu đặt mục tiêu!</div>
            </div>
          )}

          {!loading && !error && grouped.map(([date, items]) => (
            <div key={date} className="todo-day-card">
              <div className="todo-date">{date}</div>
              {items.map(it => (
                <div key={`${it.dayIndex}-${it.taskIndex}`} className="todo-item">
                  <input 
                    type="checkbox" 
                    className="todo-checkbox"
                    checked={it.progress >= 100} 
                    onChange={e => onToggleDone(it, e.target.checked)} 
                  />
                  <div className="todo-text">{it.text}</div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${snap(it.progress)}%` }}
                    ></div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={25}
                      value={snap(it.progress)}
                      onChange={e => onChangeProgress(it, Number(e.target.value))}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div className="progress-percentage-small">{snap(it.progress)}%</div>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
      
      <PlanUpdateNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        message="✅ Kế hoạch tiết kiệm đã được cập nhật!"
      />
    </div>
  );
};

export default PersonalPage;