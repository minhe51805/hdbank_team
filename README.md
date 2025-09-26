## FinLedgerAI – Trợ lý tài chính cá nhân hóa, dự đoán thông minh, ghi nhận minh bạch trên blockchain

FinLedgerAI là một giải pháp end‑to‑end kết hợp AI/ML, LLM, Web, Mobile chat (Zalo Bot) và Blockchain để đem lại trải nghiệm quản lý tài chính cá nhân hóa, minh bạch và có thể kiểm chứng.

- **Cá nhân hóa**: mô hình dự đoán hành vi/khả năng quan tâm sản phẩm, phân khúc theo persona, sinh gợi ý hành động ngắn gọn từ LLM có căn cứ (facts).
- **Minh bạch**: mọi tương tác/khuyến nghị quan trọng được băm và ghi nhận on‑chain (AdviceLog) giúp kiểm chứng nguồn gốc, nội dung và thời điểm.
- **Đa kênh**: giao diện Web React, và tích hợp Zalo Bot để tư vấn/gợi ý trực tiếp cho khách hàng.


### Quy mô và kiến trúc

Hệ thống bao gồm 4 lớp chính:

1) **Frontend (React TypeScript)**
   - Ứng dụng khách `hdbank-react` với các trang Personal, Explorer (blockchain explorer tuỳ biến), Profile, Login.
   - Popup thông báo ưu đãi (Notification Toast) hiển thị theo từng `customer_id` dựa trên dữ liệu ML trong DB.

2) **Backend API (Node.js/Express)** – thư mục `server/`
   - Cung cấp các API xác thực, phát hiện cơ hội/ưu đãi dựa trên bảng dự đoán (`predictions_llm_with_facts`) và các hook ghi nhận on‑chain.
   - Đồng bộ artefacts của smart contract để truy vấn và ghi log sự kiện.

3) **AI/ML & LLM (Python / Notebooks)**
   - Notebook huấn luyện mô hình dự đoán (Logistic + Calibration) và ghi kết quả vào PostgreSQL: bảng `predictions`, `predictions_llm_with_facts` (kèm facts, explanation).
   - Sinh “facts” từ top‑factors và explainer ngắn gọn từ LLM (Gemini).

4) **Blockchain (Hardhat + Solidity)**
   - Hợp đồng `AdviceLog.sol`: sự kiện ghi nhận lời khuyên/khuyến nghị (hash input, hash output, modelVersion, persona, customerHash, sessionHash, stage, nonce, blockTime).
   - Dùng mạng local (Hardhat) cho phát triển; có script deploy và artefacts export về `blockchain/artifacts-exports/AdviceLog.json`.

5) **Zalo Bot Integration (FastAPI Python)**
   - Webhook nhận tin nhắn, gọi CashyBear API (chat/plan), và phản hồi người dùng qua Zalo Bot API.
   - Có thể expose webhook bằng `tailscale funnel` cho môi trường dev/demonstration.


### Chức năng nổi bật

- **Dashboard cá nhân**: KPI, nhiệm vụ (to‑do theo ngày), gợi ý hành động, popup ưu đãi theo hồ sơ.
- **Chatbot persona (CashyBear)**: Mentor/AngryMom/Banter, trả lời theo ngữ cảnh, gợi ý kế hoạch 7–14 ngày, theo dõi tiến độ.
- **Explorer**: “mini‑etherscan” tra cứu các sự kiện AdviceLog theo block/tx/stage/customer.
- **Ưu đãi theo thời điểm**: dựa trên xác suất dự đoán + “facts” (ví dụ: DTI cao/thấp, biến động dòng tiền…) để quyết định hiển thị.
- **Ghi nhận on‑chain**: mọi chat reply/plan propose/plan accept đều có hook ghi hash nội dung và metadata lên blockchain local.


### Luồng dữ liệu & quyết định

1) ML notebook huấn luyện và ghi kết quả vào PostgreSQL:
   - Bảng `predictions_llm_with_facts(customer_id, year_month, probability, decision, facts, explanation, created_at)`.
2) Backend API `/signals/offer` đọc bản ghi mới nhất của từng khách hàng để quyết định hiển thị popup (và nội dung lines).
3) Frontend đọc `customerId` từ localStorage, gọi `/signals/offer` và hiển thị Notification Toast theo từng khách hàng.
4) Khi người dùng tương tác (chat/nhận plan/accept), Backend hook ghi hash lên `AdviceLog` để bảo đảm tính toàn vẹn và truy xuất sau này.


### Tech stack

- Frontend: React + TypeScript, CSS Modules
- Backend: Node.js (Express), ethers.js (on‑chain), PostgreSQL (pg)
- AI/ML: Python, scikit‑learn, pandas, joblib, Google Generative AI (LLM)
- Blockchain: Solidity, Hardhat (local dev), Ethers
- Messaging: Zalo Bot (Webhook FastAPI), Tailscale (funnel) cho dev demo


### Cấu trúc thư mục (rút gọn)

```
blockchain/
  contracts/AdviceLog.sol
  scripts/deploy.js
  artifacts-exports/AdviceLog.json
server/
  index.js (Express API, on‑chain hooks, explorer APIs)
hdbank-react/
  src/pages/ (Home, Personal, Explorer, Profile, Login)
  src/components/ui/ (ChatBot, NotificationToast)
  src/utils/promoAPI.ts (gọi /signals/offer)
notebooks & models/
  CustomerPotentialModel.ipynb (train + ghi kết quả vào DB)
  CashyBear_Persona_Chatbot.ipynb (FastAPI chat)
zalo_bot_integration.py (Webhook Zalo)
docker-compose.yml (Postgres dev)
```


### API chính (Express server, mặc định http://127.0.0.1:4000)

```text
GET  /health
POST /auth/login { username, password } → { customerId, username }

# Ưu đãi/khuyến nghị dựa trên ML
GET  /signals/offer?customerId=1&threshold=0.6&year_month=2025-08
  → { shouldNotify, probability, decision, facts, message }

# Ghi nhận on‑chain (hash input/output + metadata)
POST /advice/log
POST /advice/log-auto
POST /hook/chat/reply
POST /hook/plan/propose
POST /hook/plan/accept

# Explorer
GET  /advice/logs            (lọc block/tx/stage/customer/date)
GET  /advice/logs/by-customer?customerId=66
GET  /advice/logs/by-session?sessionId=abc
GET  /advice/tx?hash=0x...
```


### Khởi chạy nhanh (dev)

1) Database (PostgreSQL) – dùng Docker:
```bash
docker compose up -d
```

2) Blockchain local (Hardhat):
```bash
cd blockchain
npx hardhat node | cat
npx hardhat run scripts/deploy.js --network localhost | cat
```

3) Backend API:
```bash
cd server
npm install
npm start
```

4) Frontend (React):
```bash
cd hdbank-react
npm install
npm start
```

5) Chat API (CashyBear, nếu cần):
```bash
python CashyBear_Persona_Chatbot.ipynb  # chạy trong Jupyter / VSCode Notebook
```

6) Zalo Bot webhook (tuỳ chọn demo):
```bash
python zalo_bot_integration.py
# expose webhook dev qua tailscale
tailscale funnel --https=443 localhost:8011
```


### Biến môi trường gợi ý

```text
# Backend / Postgres
PG_HOST=localhost
PG_PORT=5435
PG_DB=db_fin
PG_USER=HiepData
PG_PASSWORD=123456

# LLM (tùy chọn)
GEMINI_API_KEY=...  

# Zalo Bot (tùy chọn demo)
ZALO_BOT_TOKEN=....
```


### Bảo mật & riêng tư

- Token/API key phải được giữ ở biến môi trường, không commit vào repo.
- Dữ liệu người dùng được trích lọc (hash) khi ghi on‑chain; nội dung đầy đủ lưu ở hệ thống riêng (DB/logs) nếu cần.


### Roadmap ngắn

- Kết nối mạng testnet (Sepolia/Polygon Mumbai) để minh bạch công khai.
- Bổ sung Explainability chart trong UI (calibration, feature attributions).
- Hoàn thiện audit log và chữ ký số cho hook backend.


### Giấy phép

Mục đích nghiên cứu và demo nội bộ. Tùy chỉnh để phù hợp chính sách CNTT của tổ chức trước khi vận hành.


