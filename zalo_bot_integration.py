#!/usr/bin/env python3
"""
Zalo Bot Integration for HDBank CashyBear
Handles webhook from Zalo Bot and forwards to CashyBear API
"""

import asyncio
import json
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
import uvicorn
from typing import Dict, Any, Optional, List
import logging
import time

# Zalo Bot Configuration
ZALO_BOT_TOKEN = "KeyChatbot"
ZALO_API_BASE = "https://bot-api.zapps.me/bot"
CASHYBEAR_API_BASE = "http://127.0.0.1:8010"

# FastAPI app for webhook
app = FastAPI(title="Zalo Bot Webhook for CashyBear", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Session mapping: Zalo User ID -> CashyBear Customer ID
USER_MAPPING: Dict[str, int] = {}
DEFAULT_CUSTOMER_ID = 1  # Fallback customer ID for demo

# 💾 Conversation storage để debug và manual reply
CONVERSATIONS: List[Dict[str, Any]] = []
LAST_CHAT_TARGET: Dict[str, Any] = {"chat_id": None, "user_id": None, "user_name": None}

class ZaloMessage:
    """Zalo message parser"""
    def __init__(self, data: dict):
        self.data = data
        self.user_id = data.get("user_id", "")
        self.message = data.get("message", {})
        self.text = self.message.get("text", "")
        self.timestamp = data.get("timestamp", 0)
    
    def is_text_message(self) -> bool:
        return bool(self.text)

def get_customer_id_for_user(zalo_user_id: str) -> int:
    """Map Zalo user to HDBank customer ID - mặc định customer_id = 1"""
    # 🔧 Luôn trả về customer_id = 1 cho tất cả user Zalo theo yêu cầu
    logger.info(f"👤 Mapping Zalo user {zalo_user_id} → Customer ID: 1")
    return 1

def save_conversation(user_id: str, user_name: str, chat_id: str, user_message: str, bot_reply: str, webhook_data: dict):
    """Lưu conversation để debug và manual reply"""
    import time
    
    conv = {
        "timestamp": time.time(),
        "datetime": time.strftime("%Y-%m-%d %H:%M:%S"),
        "user_id": user_id,
        "user_name": user_name,
        "chat_id": chat_id,
        "user_message": user_message,
        "bot_reply": bot_reply,
        "customer_id": 1,
        "webhook_data": webhook_data,
        "send_attempts": [],
        "manual_reply_sent": False
    }
    
    CONVERSATIONS.append(conv)
    # Giữ chỉ 100 conversation gần nhất
    if len(CONVERSATIONS) > 100:
        CONVERSATIONS[:] = CONVERSATIONS[-100:]
    
    # Update last target
    try:
        global LAST_CHAT_TARGET
        LAST_CHAT_TARGET = {"chat_id": chat_id, "user_id": user_id, "user_name": user_name, "ts": conv["timestamp"]}
    except Exception:
        pass

    logger.info(f"💾 Saved conversation: {user_name} ({user_id}) → Customer 1")
    return conv

@app.get("/last_chat_target")
async def last_chat_target():
    """Return latest chat target (chat_id, user_id, user_name)."""
    return {"ok": True, **LAST_CHAT_TARGET}

@app.post("/trigger/spend")
async def trigger_spend(payload: Dict[str, Any]):
    """
    Trigger: accept { amount: number|string, note?: string, persona?: string, chat_id?: string }
    - If chat_id omitted, use most recent chat target
    - Compose a message like: "Mình vừa chi tiêu {amount} cho {note}. Cập nhật giúp nhé."
    - Send to CashyBear API (as chat) and forward reply to Zalo chat_id
    """
    try:
        amt_raw = str(payload.get("amount", "")).strip()
        note = str(payload.get("note", "")).strip()
        persona = str(payload.get("persona", "Angry Mom") or "Angry Mom")
        chat_id = payload.get("chat_id") or LAST_CHAT_TARGET.get("chat_id")
        user_id = LAST_CHAT_TARGET.get("user_id")
        if not chat_id or not user_id:
            return JSONResponse({"ok": False, "error": "No recent chat target. Please send a message on Zalo first."}, status_code=400)

        # Normalize amount
        try:
            amt = float(str(amt_raw).replace(",", "").replace(".", "").replace(" ", "")) if str(amt_raw).isdigit() else float(amt_raw)
        except Exception:
            # keep as raw text
            amt = None

        # Map to customer and session
        customer_id = get_customer_id_for_user(user_id)
        session_id = f"zalo_{user_id}"

        # Compose message to CashyBear
        if amt is not None:
            msg = f"Mình vừa chi tiêu {amt:,.0f} VND".replace(",", ".")
        else:
            msg = f"Mình vừa chi tiêu {amt_raw}"
        if note:
            msg += f" cho {note}"
        msg += ". Cập nhật giúp nhé."

        # Fetch current plan summary to compare against target
        plan_note = ""
        try:
            r = requests.get(f"{CASHYBEAR_API_BASE}/dashboard/todo", params={"customerId": customer_id}, timeout=8)
            if r.status_code == 200:
                dj = r.json()
                summary = dj.get("summary", {}) if isinstance(dj, dict) else {}
                rec_week = summary.get("recommendedWeeklySave")
                weekly_cap = summary.get("weeklyCapSave")
                # Approximate daily target from recommended weekly
                if rec_week is not None:
                    try:
                        rec_week_f = float(rec_week)
                        daily_target = rec_week_f / 7.0
                        if amt is not None:
                            over = float(amt) - daily_target
                            if over > 0:
                                plan_note = f"Theo kế hoạch ~{rec_week_f:,.0f} VND/tuần (~{daily_target:,.0f} VND/ngày). Hôm nay mình đang vượt khoảng {over:,.0f} VND.".replace(",", ".")
                            else:
                                plan_note = f"Theo kế hoạch ~{rec_week_f:,.0f} VND/tuần (~{daily_target:,.0f} VND/ngày). Hôm nay vẫn trong mức (dư {abs(over):,.0f} VND).".replace(",", ".")
                        else:
                            plan_note = f"Theo kế hoạch ~{rec_week_f:,.0f} VND/tuần (~{daily_target:,.0f} VND/ngày).".replace(",", ".")
                    except Exception:
                        pass
                elif weekly_cap is not None:
                    try:
                        wc = float(weekly_cap)
                        plan_note = f"Dư địa tuần tối đa ~{wc:,.0f} VND (~{wc/7.0:,.0f} VND/ngày).".replace(",", ".")
                    except Exception:
                        pass
        except Exception:
            pass

        enriched = msg
        if plan_note:
            warning = ""
            try:
                if "vượt khoảng" in plan_note:
                    warning = "\n\n[Chế độ Angry Mom] Này này! Chi tiêu kiểu này là đi sai plan rồi đó nha. Cắt bớt ăn uống, dừng quẹt thẻ vô tội vạ, ưu tiên tự nấu ở nhà và hoàn thành nhiệm vụ ngày hôm nay. Nghe rõ chưa?"
            except Exception:
                pass
            enriched = msg + "\n" + plan_note + warning + "\nNhờ nhắc nếu mình lệch kế hoạch và gợi ý cách cân đối lại cho ngày/tuần này nhé."

        logger.info(f"🧩 Trigger spend → CashyBear: {enriched}")
        cb = await call_cashybear_api(customer_id=customer_id, message=enriched, session_id=session_id, persona=persona)
        reply_text = cb.get("reply", "Đã ghi nhận khoản chi tiêu.")
        if len(reply_text) > 1900:
            reply_text = reply_text[:1900] + "... (rút gọn)"

        ok = await send_zalo_message(chat_id, reply_text)
        return JSONResponse({"ok": bool(ok), "chat_id": chat_id, "reply": reply_text})
    except Exception as e:
        logger.error(f"/trigger/spend error: {e}")
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)

async def call_cashybear_api(customer_id: int, message: str, session_id: str, persona: str = "Angry Mom") -> Dict[str, Any]:
    """Call CashyBear chat API"""
    try:
        payload = {
            "customerId": customer_id,
            "persona": persona,
            "sessionId": session_id,
            "message": message,
            "currentDate": "2025-01-17T10:00:00Z",  # Current timestamp
            "timezone": "Asia/Ho_Chi_Minh"
        }
        
        response = requests.post(
            f"{CASHYBEAR_API_BASE}/chat/reply",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"CashyBear API error: {response.status_code} - {response.text}")
            return {"reply": "Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau."}
    
    except Exception as e:
        logger.error(f"Error calling CashyBear API: {e}")
        return {"reply": "Xin lỗi, tôi không thể kết nối đến hệ thống. Vui lòng thử lại sau."}

async def send_zalo_message(chat_id: str, text: str) -> bool:
    """Send message via Zalo Bot Creator (zapps.me) sendMessage API.
    Spec per docs: POST https://bot-api.zapps.me/bot{BOT_TOKEN}/sendMessage
    Body: { chat_id: string, text: string }
    """
    try:
        # Spec: https://bot-api.zapps.me/bot{BOT_TOKEN}/sendMessage (no slash between 'bot' and token)
        url = f"{ZALO_API_BASE}{ZALO_BOT_TOKEN}/sendMessage"
        payload = {"chat_id": chat_id, "text": text}
        headers = {"Content-Type": "application/json"}

        logger.info(f"📤 Sending to Zalo (zapps): {url}")
        logger.info(f"📦 Payload: {json.dumps(payload, ensure_ascii=False)}")

        # Try normal TLS first
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=12)
        except requests.exceptions.SSLError as ssl_err:
            logger.warning(f"⚠️ SSL verify failed: {ssl_err}. Retrying with system CA fallback...")
            # Retry with certifi CA bundle if available
            try:
                import certifi
                response = requests.post(url, json=payload, headers=headers, timeout=12, verify=certifi.where())
            except Exception as e2:
                logger.warning(f"⚠️ certifi retry failed: {e2}. Last resort retry with verify=False")
                response = requests.post(url, json=payload, headers=headers, timeout=12, verify=False)

        logger.info(f"📨 Response status: {response.status_code}")
        logger.info(f"📨 Response body: {response.text}")

        if response.status_code == 200:
            try:
                data = response.json()
            except Exception:
                data = {}
            ok = bool(data.get("ok"))
            if not ok:
                logger.warning(f"⚠️ Zapps sendMessage returned error: {data}")
            return ok

        logger.error(f"❌ Zapps sendMessage HTTP error: {response.status_code}")
        return False
    except Exception as e:
        logger.error(f"❌ Error sending Zalo message: {e}")
        return False

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Zalo Bot Webhook for CashyBear"}

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    # Test connection to CashyBear
    try:
        response = requests.get(f"{CASHYBEAR_API_BASE}/health", timeout=5)
        cashybear_status = "ok" if response.status_code == 200 else "error"
    except:
        cashybear_status = "unreachable"
    
    return {
        "status": "ok",
        "cashybear": cashybear_status,
        "timestamp": "2025-01-17T10:00:00Z"
    }

@app.post("/webhook-test/{test_id}")
async def zalo_webhook_test(test_id: str, request: Request):
    """Handle Zalo Bot webhook test - now processes real messages"""
    try:
        body = await request.body()
        logger.info(f"✅ Received webhook test {test_id}: {body.decode() if body else 'empty'}")
        
        # Parse webhook data - này giờ xử lý tin nhắn thật
        if body:
            webhook_data = json.loads(body.decode())
            
            # Extract message info
            event_name = webhook_data.get("event_name")
            if event_name == "message.text.received":
                message_data = webhook_data.get("message", {})
                user_message = message_data.get("text", "")
                chat_data = message_data.get("chat", {})
                user_data = message_data.get("from", {})
                
                chat_id = chat_data.get("id")
                user_id = user_data.get("id")
                user_name = user_data.get("display_name", "User")
                
                if user_message and user_id:
                    logger.info(f"💬 Processing message from {user_name}: '{user_message}'")
                    
                    # Get customer ID (mặc định = 1)
                    customer_id = get_customer_id_for_user(user_id)
                    session_id = f"zalo_{user_id}"
                    
                    logger.info(f"🚀 Calling CashyBear API: customer_id={customer_id}, message='{user_message[:50]}...'")
                    
                    # Call CashyBear API
                    cashybear_response = await call_cashybear_api(
                        customer_id=customer_id,
                        message=user_message,
                        session_id=session_id,
                        persona="Angry Mom"
                    )
                    
                    reply_text = cashybear_response.get("reply", "Xin lỗi, tôi không hiểu. Vui lòng thử lại.")
                    logger.info(f"📨 CashyBear response: {reply_text[:100]}...")
                    
                    # Truncate if too long for Zalo
                    if len(reply_text) > 1900:
                        reply_text = reply_text[:1900] + "... (tin nhắn đã được rút gọn)"
                    
                    # 💾 Lưu conversation để debug và manual reply
                    conv = save_conversation(
                        user_id=user_id, 
                        user_name=user_name, 
                        chat_id=chat_id, 
                        user_message=user_message, 
                        bot_reply=reply_text,
                        webhook_data=webhook_data
                    )
                    
                    # 🔄 Thử gửi automatic reply (zapps sendMessage dùng chat_id)
                    success = await send_zalo_message(chat_id, reply_text)
                    
                    if success:
                        logger.info(f"✅ Successfully sent auto reply to user {user_id}")
                        conv["manual_reply_sent"] = True
                    else:
                        logger.error(f"❌ Auto reply failed. Conversation saved for manual response.")
                        logger.info(f"📋 Access /conversations to see pending messages")
                    
                    return JSONResponse({
                        "ok": True,
                        "status": "success", 
                        "message": "Message processed and replied",
                        "test_id": test_id,
                        "sent_reply": success
                    })
        
        # Fallback for non-message events
        return JSONResponse({
            "ok": True,
            "status": "success", 
            "message": "Webhook test successful",
            "test_id": test_id,
            "timestamp": "2025-01-17T10:00:00Z"
        })
        
    except Exception as e:
        logger.error(f"❌ Webhook test error: {e}")
        return JSONResponse({"ok": False, "status": "error", "message": str(e)})

@app.api_route("/webhook-test/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def zalo_webhook_test_catchall(path: str, request: Request):
    """Catch-all for any webhook test patterns"""
    try:
        method = request.method
        body = await request.body()
        logger.info(f"🔍 Webhook test catch-all [{method}] /{path}: {body.decode() if body else 'empty'}")
        
        return JSONResponse({
            "ok": True,
            "status": "success",
            "message": f"Webhook test successful for {method} /{path}",
            "timestamp": "2025-01-17T10:00:00Z"
        })
    except Exception as e:
        logger.error(f"❌ Webhook catch-all error: {e}")
        return JSONResponse({"ok": False, "status": "error", "message": str(e)})

@app.post("/webhook")
async def zalo_webhook(request: Request):
    """Main webhook endpoint for Zalo Bot"""
    try:
        # Parse incoming webhook data
        body = await request.body()
        data = json.loads(body.decode())
        
        logger.info(f"Received Zalo webhook: {data}")
        
        # Parse Zalo message
        zalo_msg = ZaloMessage(data)
        
        if not zalo_msg.is_text_message():
            logger.info("Non-text message, ignoring")
            return JSONResponse({"status": "ok"})
        
        user_id = zalo_msg.user_id
        user_message = zalo_msg.text
        
        if not user_id or not user_message:
            logger.warning("Missing user_id or message")
            return JSONResponse({"status": "error", "message": "Invalid message format"})
        
        # Get customer ID for this Zalo user (mặc định = 1)
        customer_id = get_customer_id_for_user(user_id)
        
        # Generate session ID (use Zalo user ID as session)
        session_id = f"zalo_{user_id}"
        
        logger.info(f"🚀 Calling CashyBear API: customer_id={customer_id}, message='{user_message[:50]}...'")
        
        # Call CashyBear API
        cashybear_response = await call_cashybear_api(
            customer_id=customer_id,
            message=user_message,
            session_id=session_id,
            persona="Angry Mom"  # Default persona for Zalo
        )
        
        logger.info(f"📨 CashyBear response: {cashybear_response.get('reply', '')[:100]}...")
        
        # Extract reply from CashyBear
        reply_text = cashybear_response.get("reply", "Xin lỗi, tôi không hiểu. Vui lòng thử lại.")
        
        # Truncate if too long for Zalo (max ~2000 chars)
        if len(reply_text) > 1900:
            reply_text = reply_text[:1900] + "... (tin nhắn đã được rút gọn)"
        
        # Send reply back to Zalo (zapps sendMessage expects chat_id)
        # For /webhook we may not have chat_id → fallback to user_id
        chat_id = data.get("message", {}).get("chat", {}).get("id") or user_id
        success = await send_zalo_message(chat_id, reply_text)
        
        if success:
            logger.info(f"Successfully sent reply to user {user_id}")
        else:
            logger.error(f"Failed to send reply to user {user_id}")
        
        return JSONResponse({"status": "ok", "sent": success})
    
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return JSONResponse(
            {"status": "error", "message": str(e)}, 
            status_code=500
        )

@app.post("/set_user_mapping")
async def set_user_mapping(zalo_user_id: str, customer_id: int):
    """Set mapping between Zalo user and HDBank customer (for admin)"""
    USER_MAPPING[zalo_user_id] = customer_id
    return {"status": "ok", "mapping": {zalo_user_id: customer_id}}

@app.get("/user_mappings")
async def get_user_mappings():
    """Get all user mappings (for admin)"""
    return {"mappings": USER_MAPPING}

@app.get("/conversations")
async def get_conversations():
    """Xem tất cả conversation để debug"""
    pending = [c for c in CONVERSATIONS if not c.get("manual_reply_sent", False)]
    return {
        "total": len(CONVERSATIONS),
        "pending": len(pending), 
        "conversations": CONVERSATIONS[-20:],  # 20 conversation gần nhất
        "pending_conversations": pending[-10:]  # 10 pending gần nhất
    }

@app.get("/conversations/{user_id}")
async def get_user_conversation(user_id: str):
    """Xem conversation của một user cụ thể"""
    user_convs = [c for c in CONVERSATIONS if c.get("user_id") == user_id]
    return {
        "user_id": user_id,
        "total": len(user_convs),
        "conversations": user_convs
    }

@app.post("/manual_reply")
async def send_manual_reply(user_id: str, message: str):
    """Gửi manual reply cho user"""
    try:
        # Tìm conversation gần nhất của user
        user_conv = None
        for conv in reversed(CONVERSATIONS):
            if conv.get("user_id") == user_id:
                user_conv = conv
                break
        
        if not user_conv:
            return {"success": False, "error": "User conversation not found"}
        
        chat_id = user_conv.get("chat_id")
        logger.info(f"📤 Manual reply to {user_id} (chat: {chat_id}): {message[:50]}...")
        
        # Thử gửi với nhiều format
        success = await send_zalo_message(chat_id, message)
        
        if success:
            user_conv["manual_reply_sent"] = True
            user_conv["manual_reply"] = message
            user_conv["manual_reply_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
        
        return {
            "success": success,
            "user_id": user_id,
            "chat_id": chat_id,
            "message": message,
            "conversation_data": user_conv
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    print("🚀 Starting Zalo Bot Webhook Server...")
    print(f"📡 CashyBear API: {CASHYBEAR_API_BASE}")
    print(f"🤖 Zalo Bot Token: {ZALO_BOT_TOKEN[:20]}...")
    print("📱 Webhook URL will be: https://your-domain.com/webhook")
    print("🔧 Use 'tailscale funnel --https=443 localhost:8011' to expose this service")
    
    uvicorn.run(app, host="127.0.0.1", port=8011, log_level="info")
