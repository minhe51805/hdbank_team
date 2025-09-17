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

  const progressAngle = (summary.completionPct / 100) * 360;

  return (
    <div className="personal-page">
      <div className="container">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Bảng điều khiển cá nhân</h1>
          <p className="dashboard-subtitle">Quản lý mục tiêu tài chính và theo dõi tiến độ hoàn thành nhiệm vụ hàng ngày</p>
        </header>

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

          {/* CashyBear Card */}
          <div className="cashybear-card">
            <div className="card-title">Gợi ý từ CashyBear</div>
            <p className="cashybear-message">
              Hãy đặt mục tiêu nhỏ theo ngày để duy trì thói quen. Mỗi bước nhỏ sẽ đưa bạn đến thành công lớn! 💪✨
            </p>
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