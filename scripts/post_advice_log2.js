(async () => {
  const base = 'http://127.0.0.1:4000';
  const body = {
    inputHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
    outputHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    modelVersion: 'gemini-1.5-pro',
    persona: 'Mentor',
    customerHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    sessionHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    stage: 'plan_proposed',
    nonce: '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
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


