(async () => {
  const base = 'http://127.0.0.1:4000';
  const body = {
    customerId: 1,
    sessionId: 'sess-123',
    persona: 'Mentor',
    modelVersion: 'gemini-1.5-pro',
    request: { amount: 20000000, months: 6, note: 'Xin đề xuất kế hoạch tiết kiệm' },
    plan: { title: 'Kế hoạch 6 tháng', week_plan: [{ date: '2025-09-15', tasks: ['Tiết kiệm 120k/ngày'] }] },
    nonce: 'demo-plan-proposed-1'
  };

  const res = await fetch(`${base}/hook/plan/propose`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const out = await res.text();
  console.log('POST /hook/plan/propose →', out);

  const logs = await fetch(`${base}/advice/logs`).then(r => r.text());
  console.log('GET /advice/logs →', logs);
})();


