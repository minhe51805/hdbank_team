const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const DB_CONFIGS = [
  { host: '127.0.0.1', port: 5435, database: 'db_fin', user: 'HiepData', password: '123456' },
  { host: '127.0.0.1', port: 5435, database: 'db_fin_customer', user: 'HiepData', password: '123456' },
];

async function createPool() {
  let lastError = null;
  for (const cfg of DB_CONFIGS) {
    try {
      const pool = new Pool({
        host: cfg.host,
        port: cfg.port,
        database: cfg.database,
        user: cfg.user,
        password: cfg.password,
        max: 10,
      });
      await pool.query('SELECT 1');
      console.log(`[auth-api] Connected to Postgres: ${cfg.database} on ${cfg.host}:${cfg.port}`);
      return pool;
    } catch (err) {
      lastError = err;
      console.warn(`[auth-api] Failed to connect ${cfg.database}:`, err.message);
    }
  }
  throw lastError || new Error('No DB config succeeded');
}

async function main() {
  const pool = await createPool();

  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: '1mb' }));

  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e.message || e) });
    }
  });

  app.post('/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: 'Thiếu username hoặc password' });
      }

      const q =
        'SELECT customer_id, username FROM customer_accounts WHERE username = $1 AND password = $2 LIMIT 1;';
      const { rows } = await pool.query(q, [String(username), String(password)]);

      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Sai thông tin đăng nhập' });
      }

      const row = rows[0];
      return res.json({ customerId: row.customer_id, username: row.username });
    } catch (e) {
      console.error('[auth-api] /auth/login error:', e);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });

  // Offer signal based on predictions_llm_with_facts
  app.get('/signals/offer', async (req, res) => {
    try {
      const customerId = Number(req.query.customerId);
      const threshold = req.query.threshold ? Number(req.query.threshold) : 0.6;
      const yearMonth = String(req.query.year_month || '2025-08');

      if (!customerId || Number.isNaN(customerId)) {
        return res.status(400).json({ error: 'Thiếu hoặc sai customerId' });
      }

      const q = `
        SELECT customer_id, year_month, probability, decision, facts, created_at
        FROM predictions_llm_with_facts
        WHERE customer_id = $1 AND year_month = $2
        ORDER BY created_at DESC
        LIMIT 1;
      `;
      const { rows } = await pool.query(q, [customerId, yearMonth]);
      const row = rows && rows.length ? rows[0] : null;

      const probability = row ? Number(row.probability) : null;
      const shouldNotify = probability !== null && probability > threshold;

      const message = shouldNotify
        ? {
            title: '✨ Ưu đãi dành riêng cho bạn – Đừng bỏ lỡ!',
            lines: [
              '👉 Đặt vé bay ngay hôm nay để được giảm 20%.',
              '⏰ Voucher chỉ còn hiệu lực 1 ngày nữa – tranh thủ kẻo lỡ nha!'
            ],
            timeoutMs: 10000,
          }
        : null;

      return res.json({
        shouldNotify,
        probability,
        decision: row ? row.decision : null,
        facts: row ? row.facts : null,
        year_month: yearMonth,
        message,
      });
    } catch (e) {
      console.error('[auth-api] /signals/offer error:', e);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
  });

  app.listen(PORT, () => {
    console.log(`[auth-api] Listening on http://127.0.0.1:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[auth-api] Fatal error:', err);
  process.exit(1);
});


