#!/usr/bin/env python3
"""
Complete Zalo Bot Integration Startup Script
Starts CashyBear API and Zalo Webhook integration
"""

import subprocess
import time
import requests
import sys
import threading
import signal
import os
from pathlib import Path

# Configuration
CASHYBEAR_PORT = 8010
WEBHOOK_PORT = 8011
WEBHOOK_PATH = "/webhook"

def check_port_available(port: int) -> bool:
    """Check if port is available"""
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result != 0  # Port is available if connection fails
    except:
        return False

def wait_for_service(url: str, timeout: int = 30) -> bool:
    """Wait for service to be ready"""
    print(f"⏳ Waiting for service at {url}...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                print(f"✅ Service ready at {url}")
                return True
        except:
            pass
        
        time.sleep(1)
        print(".", end="", flush=True)
    
    print(f"\n❌ Service not ready after {timeout}s")
    return False

def start_cashybear():
    """Start CashyBear API (requires manual start in Jupyter)"""
    print(f"🐻 CashyBear API should be running on port {CASHYBEAR_PORT}")
    print("📝 Please ensure CashyBear_Persona_Chatbot.ipynb is running with FastAPI server")
    
    # Check if CashyBear is already running
    if wait_for_service(f"http://127.0.0.1:{CASHYBEAR_PORT}/health", timeout=5):
        print("✅ CashyBear API is running")
        return True
    else:
        print("❌ CashyBear API not detected")
        print("📋 To start CashyBear:")
        print("   1. Open CashyBear_Persona_Chatbot.ipynb in Jupyter")
        print("   2. Run all cells to start FastAPI server")
        print("   3. Ensure it's running on port 8010")
        return False

def start_webhook_server():
    """Start Zalo webhook server"""
    print(f"🔌 Starting Zalo webhook server on port {WEBHOOK_PORT}...")
    
    if not check_port_available(WEBHOOK_PORT):
        print(f"❌ Port {WEBHOOK_PORT} is already in use")
        return None
    
    try:
        # Start webhook server
        process = subprocess.Popen([
            sys.executable, "zalo_bot_integration.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait for server to start
        if wait_for_service(f"http://127.0.0.1:{WEBHOOK_PORT}/health", timeout=10):
            print(f"✅ Webhook server started (PID: {process.pid})")
            return process
        else:
            print("❌ Failed to start webhook server")
            process.terminate()
            return None
    
    except Exception as e:
        print(f"❌ Error starting webhook server: {e}")
        return None

def get_tailscale_url():
    """Get Tailscale funnel URL (you need to run this manually)"""
    print("\n🔗 Tailscale Funnel Setup:")
    print("=" * 50)
    print("To expose webhook server, run this command:")
    print(f"   tailscale funnel --https=443 localhost:{WEBHOOK_PORT}")
    print()
    print("This will give you a public URL like:")
    print("   https://your-machine-name.tail-scale.ts.net")
    print()
    
    webhook_url = input("🌐 Enter your Tailscale public URL (or press Enter to skip): ").strip()
    
    if webhook_url:
        if not webhook_url.startswith("https://"):
            webhook_url = "https://" + webhook_url
        
        if not webhook_url.endswith(WEBHOOK_PATH):
            webhook_url = webhook_url.rstrip("/") + WEBHOOK_PATH
        
        return webhook_url
    
    return None

def setup_zalo_webhook(webhook_url: str):
    """Setup Zalo Bot webhook"""
    print(f"\n🤖 Setting up Zalo Bot webhook...")
    print(f"📡 Webhook URL: {webhook_url}")
    
    try:
        # Run webhook setup script
        result = subprocess.run([
            sys.executable, "setup_zalo_webhook.py", "set", webhook_url
        ], capture_output=True, text=True, timeout=30)
        
        print("📤 Webhook setup output:")
        print(result.stdout)
        
        if result.stderr:
            print("⚠️ Warnings/Errors:")
            print(result.stderr)
        
        return result.returncode == 0
    
    except Exception as e:
        print(f"❌ Error setting up webhook: {e}")
        return False

def print_status():
    """Print current status"""
    print("\n📊 System Status:")
    print("=" * 30)
    
    # Check CashyBear API
    try:
        response = requests.get(f"http://127.0.0.1:{CASHYBEAR_PORT}/health", timeout=2)
        print(f"🐻 CashyBear API: ✅ Running (port {CASHYBEAR_PORT})")
    except:
        print(f"🐻 CashyBear API: ❌ Not running (port {CASHYBEAR_PORT})")
    
    # Check Webhook server
    try:
        response = requests.get(f"http://127.0.0.1:{WEBHOOK_PORT}/health", timeout=2)
        print(f"🔌 Webhook Server: ✅ Running (port {WEBHOOK_PORT})")
    except:
        print(f"🔌 Webhook Server: ❌ Not running (port {WEBHOOK_PORT})")

def main():
    print("🚀 HDBank CashyBear x Zalo Bot Integration")
    print("=" * 50)
    
    # Step 1: Check CashyBear API
    if not start_cashybear():
        print("\n❌ Cannot continue without CashyBear API")
        print("Please start CashyBear first, then run this script again")
        return
    
    # Step 2: Start webhook server
    webhook_process = start_webhook_server()
    if not webhook_process:
        print("\n❌ Cannot start webhook server")
        return
    
    try:
        # Step 3: Get Tailscale URL
        webhook_url = get_tailscale_url()
        
        if webhook_url:
            # Step 4: Setup Zalo webhook
            if setup_zalo_webhook(webhook_url):
                print("\n🎉 Integration setup complete!")
            else:
                print("\n⚠️ Webhook setup failed, but servers are running")
        else:
            print("\n⚠️ Skipping webhook setup - servers are running locally")
        
        # Step 5: Show status and keep running
        print_status()
        
        print("\n🔧 Integration Commands:")
        print("=" * 25)
        print("• Test CashyBear API:")
        print(f"  curl http://127.0.0.1:{CASHYBEAR_PORT}/health")
        print("• Test Webhook server:")
        print(f"  curl http://127.0.0.1:{WEBHOOK_PORT}/health")
        print("• View webhook logs:")
        print("  Check console output below")
        
        print("\n⌨️  Press Ctrl+C to stop all services")
        print("📱 Your Zalo Bot is now ready to receive messages!")
        
        # Keep running and show webhook logs
        while True:
            time.sleep(1)
    
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping services...")
        webhook_process.terminate()
        webhook_process.wait()
        print("✅ All services stopped")

if __name__ == "__main__":
    main()
