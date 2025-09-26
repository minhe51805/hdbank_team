// Simple helper to POST an advice log and print the response, then fetch logs
(async () => {
  const base = 'http://127.0.0.1:4000';
  const body = {
    inputHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    outputHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
    modelVersion: 'gemini-1.5-pro',
    persona: 'Mentor',
    customerHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    sessionHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    stage: 'chat_reply',
    nonce: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
  };

  const res = await fetch(`${base}/advice/log`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const out = await res.text();
  console.log('POST /advice/log →', out);

  const logs = await fetch(`${base}/advice/logs`).then(r => r.text());
  console.log('GET /advice/logs →', logs);
})();


