#!/usr/bin/env python3
"""
Setup Zalo Bot Webhook
Sets webhook URL for Zalo Bot to receive messages
"""

import requests
import json
import sys

# Zalo Bot Configuration
BOT_TOKEN = "APP_KEY"
ZALO_API_BASE = "https://bot-api.zapps.me/bot"

def set_webhook(webhook_url: str) -> dict:
    """Set webhook URL for Zalo Bot"""
    url = f"{ZALO_API_BASE}/{BOT_TOKEN}/setWebhook"
    
    payload = {
        "url": webhook_url,
        "allowed_updates": ["message"]  # Only receive text messages
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        
        print(f"📡 Request URL: {url}")
        print(f"📤 Payload: {json.dumps(payload, indent=2)}")
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "ok": False,
                "error": f"HTTP {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)
        }

def get_webhook_info() -> dict:
    """Get current webhook information"""
    url = f"{ZALO_API_BASE}/{BOT_TOKEN}/getWebhookInfo"
    
    try:
        response = requests.get(url, timeout=10)
        
        print(f"📡 Request URL: {url}")
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "ok": False,
                "error": f"HTTP {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)
        }

def delete_webhook() -> dict:
    """Delete current webhook"""
    url = f"{ZALO_API_BASE}/{BOT_TOKEN}/deleteWebhook"
    
    try:
        response = requests.post(url, timeout=10)
        
        print(f"📡 Request URL: {url}")
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                "ok": False,
                "error": f"HTTP {response.status_code}: {response.text}"
            }
    
    except Exception as e:
        return {
            "ok": False,
            "error": str(e)
        }

def main():
    print("🤖 Zalo Bot Webhook Setup Tool")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python setup_zalo_webhook.py <command> [webhook_url]")
        print()
        print("Commands:")
        print("  info           - Get current webhook info")
        print("  set <url>      - Set webhook URL")
        print("  delete         - Delete current webhook")
        print()
        print("Example:")
        print("  python setup_zalo_webhook.py set https://your-tailscale-url.com/webhook")
        return
    
    command = sys.argv[1].lower()
    
    if command == "info":
        print("📋 Getting webhook info...")
        result = get_webhook_info()
        print(f"✅ Result: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    elif command == "set":
        if len(sys.argv) < 3:
            print("❌ Error: webhook URL required")
            print("Usage: python setup_zalo_webhook.py set <webhook_url>")
            return
        
        webhook_url = sys.argv[2]
        print(f"🔧 Setting webhook URL: {webhook_url}")
        result = set_webhook(webhook_url)
        print(f"✅ Result: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    elif command == "delete":
        print("🗑️ Deleting webhook...")
        result = delete_webhook()
        print(f"✅ Result: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: info, set, delete")

if __name__ == "__main__":
    main()
