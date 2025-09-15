(async () => {
  const base = 'http://127.0.0.1:4000';
  const body = {
    customerId: 1,
    sessionId: 'sess-123',
    persona: 'Mentor',
    modelVersion: 'gemini-1.5-pro',
    message: 'Tôi muốn tiết kiệm 20 triệu trong 6 tháng',
    reply: 'Bạn nên gửi tiết kiệm mỗi ngày 120k',
    nonce: 'demo-chat-1'
  };

  const res = await fetch(`${base}/hook/chat/reply`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const out = await res.text();
  console.log('POST /hook/chat/reply →', out);

  const logs = await fetch(`${base}/advice/logs`).then(r => r.text());
  console.log('GET /advice/logs →', logs);
})();


