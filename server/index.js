const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

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

function loadAdviceLogArtifact() {
  const artifactPath = path.join(__dirname, '..', 'blockchain', 'artifacts-exports', 'AdviceLog.json');
  const json = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  if (!json?.address || !json?.abi) throw new Error('AdviceLog artifact missing address/abi');
  return json;
}

function createChainProviderAndWallet() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  // Well-known hardhat private key for local dev only
  const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return { provider, wallet };
}

function canonicalStringify(value) {
  return JSON.stringify(value, Object.keys(value).sort());
}

function toBytes32(hexOrBytesLike) {
  return ethers.hexlify(ethers.zeroPadValue(hexOrBytesLike, 32));
}

function hashStringToBytes32(input) {
  const s = String(input == null ? '' : input);
  return ethers.keccak256(ethers.toUtf8Bytes(s));
}

function hashObjectToBytes32(obj) {
  try {
    const s = canonicalStringify(obj == null ? {} : obj);
    return ethers.keccak256(ethers.toUtf8Bytes(s));
  } catch (_) {
    return hashStringToBytes32(String(obj));
  }
}

async function main() {
  const pool = await createPool();
  const { address, abi } = loadAdviceLogArtifact();
  function getAdviceLog() {
    const { provider, wallet } = createChainProviderAndWallet();
    return new ethers.Contract(address, abi, wallet);
  }

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

  // POST /advice/log  -> write on-chain event
  app.post('/advice/log', async (req, res) => {
    try {
      const adviceLog = getAdviceLog();
      const {
        inputHash,
        outputHash,
        modelVersion,
        persona,
        customerHash,
        sessionHash,
        stage,
        nonce
      } = req.body || {};

      if (!inputHash || !outputHash || !modelVersion || !persona || !customerHash || !sessionHash || !stage || !nonce) {
        return res.status(400).json({ error: 'Thiếu tham số' });
      }

      const tx = await adviceLog.recordAdvice(
        inputHash,
        outputHash,
        modelVersion,
        persona,
        customerHash,
        sessionHash,
        stage,
        nonce
      );
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: receipt.hash });
    } catch (e) {
      console.error('[advice/log] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  // POST /advice/log-auto -> server tự tính hash và ghi on-chain
  app.post('/advice/log-auto', async (req, res) => {
    try {
      const body = req.body || {};
      const modelVersion = String(body.modelVersion || 'gemini-1.5-pro');
      const persona = String(body.persona || 'Mentor');
      const customerId = body.customerId;
      const sessionId = body.sessionId;
      const stage = String(body.stage || 'unknown');
      const input = body.input;
      const output = body.output ?? body.plan ?? body.reply;
      const nonceIn = body.nonce;

      if (!customerId || !sessionId || !stage || (input == null) || (output == null)) {
        return res.status(400).json({ error: 'Thiếu tham số (customerId, sessionId, stage, input, output)' });
      }

      const adviceLog = getAdviceLog();
      const inputHash = (typeof input === 'string') ? hashStringToBytes32(input) : hashObjectToBytes32(input);
      const outputHash = (typeof output === 'string') ? hashStringToBytes32(output) : hashObjectToBytes32(output);
      const customerHash = hashStringToBytes32(String(customerId));
      const sessionHash = hashStringToBytes32(String(sessionId));
      const nonce = nonceIn ? (ethers.isHexString(nonceIn) ? nonceIn : hashStringToBytes32(String(nonceIn))) : hashStringToBytes32(`${Date.now()}:${Math.random()}`);

      const tx = await adviceLog.recordAdvice(
        inputHash,
        outputHash,
        modelVersion,
        persona,
        customerHash,
        sessionHash,
        stage,
        nonce
      );
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: receipt.hash, computed: { inputHash, outputHash, customerHash, sessionHash, stage } });
    } catch (e) {
      console.error('[advice/log-auto] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  // Convenience hooks để các service khác gọi trực tiếp
  app.post('/hook/chat/reply', async (req, res) => {
    try {
      const { customerId, sessionId, persona, modelVersion, message, reply, nonce } = req.body || {};
      if (!customerId || !sessionId || (message == null) || (reply == null)) {
        return res.status(400).json({ error: 'Thiếu tham số (customerId, sessionId, message, reply)' });
      }
      const adviceLog = getAdviceLog();
      const inputHash = (typeof message === 'string') ? hashStringToBytes32(message) : hashObjectToBytes32(message);
      const outputHash = (typeof reply === 'string') ? hashStringToBytes32(reply) : hashObjectToBytes32(reply);
      const customerHash = hashStringToBytes32(String(customerId));
      const sessionHash = hashStringToBytes32(String(sessionId));
      const stage = 'chat_reply';
      const mv = String(modelVersion || 'gemini-1.5-pro');
      const ps = String(persona || 'Mentor');
      const n = nonce ? (ethers.isHexString(nonce) ? nonce : hashStringToBytes32(String(nonce))) : hashStringToBytes32(`${Date.now()}:${Math.random()}`);
      const tx = await adviceLog.recordAdvice(inputHash, outputHash, mv, ps, customerHash, sessionHash, stage, n);
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: receipt.hash, computed: { inputHash, outputHash, customerHash, sessionHash, stage } });
    } catch (e) {
      console.error('[hook/chat/reply] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post('/hook/plan/propose', async (req, res) => {
    try {
      const { customerId, sessionId, persona, modelVersion, request, plan, nonce } = req.body || {};
      if (!customerId || !sessionId || (request == null) || (plan == null)) {
        return res.status(400).json({ error: 'Thiếu tham số (customerId, sessionId, request, plan)' });
      }
      const adviceLog = getAdviceLog();
      const inputHash = (typeof request === 'string') ? hashStringToBytes32(request) : hashObjectToBytes32(request);
      const outputHash = (typeof plan === 'string') ? hashStringToBytes32(plan) : hashObjectToBytes32(plan);
      const customerHash = hashStringToBytes32(String(customerId));
      const sessionHash = hashStringToBytes32(String(sessionId));
      const stage = 'plan_proposed';
      const mv = String(modelVersion || 'gemini-1.5-pro');
      const ps = String(persona || 'Mentor');
      const n = nonce ? (ethers.isHexString(nonce) ? nonce : hashStringToBytes32(String(nonce))) : hashStringToBytes32(`${Date.now()}:${Math.random()}`);
      const tx = await adviceLog.recordAdvice(inputHash, outputHash, mv, ps, customerHash, sessionHash, stage, n);
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: receipt.hash, computed: { inputHash, outputHash, customerHash, sessionHash, stage } });
    } catch (e) {
      console.error('[hook/plan/propose] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post('/hook/plan/accept', async (req, res) => {
    try {
      const { customerId, sessionId, persona, modelVersion, plan, nonce } = req.body || {};
      if (!customerId || !sessionId || (plan == null)) {
        return res.status(400).json({ error: 'Thiếu tham số (customerId, sessionId, plan)' });
      }
      const adviceLog = getAdviceLog();
      const input = { plan };
      const output = { accepted: true, plan };
      const inputHash = hashObjectToBytes32(input);
      const outputHash = hashObjectToBytes32(output);
      const customerHash = hashStringToBytes32(String(customerId));
      const sessionHash = hashStringToBytes32(String(sessionId));
      const stage = 'plan_accepted';
      const mv = String(modelVersion || 'gemini-1.5-pro');
      const ps = String(persona || 'Mentor');
      const n = nonce ? (ethers.isHexString(nonce) ? nonce : hashStringToBytes32(String(nonce))) : hashStringToBytes32(`${Date.now()}:${Math.random()}`);
      const tx = await adviceLog.recordAdvice(inputHash, outputHash, mv, ps, customerHash, sessionHash, stage, n);
      const receipt = await tx.wait();
      return res.json({ ok: true, txHash: receipt.hash, computed: { inputHash, outputHash, customerHash, sessionHash, stage } });
    } catch (e) {
      console.error('[hook/plan/accept] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
    }
  });

  // GET /advice/logs -> read recent events
  app.get('/advice/logs', async (req, res) => {
    try {
      const adviceLog = getAdviceLog();
      const fromBlock = req.query.from ? Number(req.query.from) : 0;
      const toBlock = req.query.to ? Number(req.query.to) : 'latest';
      const filter = adviceLog.filters.AdviceRecorded();
      const events = await adviceLog.queryFilter(filter, fromBlock, toBlock);
      const out = events.map((ev) => ({
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber != null ? ev.blockNumber.toString() : null,
        args: {
          inputHash: ev.args.inputHash,
          outputHash: ev.args.outputHash,
          modelVersion: ev.args.modelVersion,
          persona: ev.args.persona,
          customerHash: ev.args.customerHash,
          sessionHash: ev.args.sessionHash,
          stage: ev.args.stage,
          blockTime: ev.args.blockTime ? ev.args.blockTime.toString() : null,
          nonce: ev.args.nonce
        }
      })).sort((a, b) => b.blockNumber - a.blockNumber);
      return res.json({ ok: true, address, events: out });
    } catch (e) {
      console.error('[advice/logs] error:', e);
      return res.status(500).json({ error: String(e.message || e) });
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


