import os
import hmac
import hashlib
import json
import logging
import asyncio
from flask import Flask, request, jsonify

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)
logger = logging.getLogger('BEAST_SYSTEM_DEPLOYER')

# Configuration from Environment Variables
WEBHOOK_SECRET = os.environ.get('GITHUB_WEBHOOK_SECRET', 'beast_system_default_secret')
PORT = int(os.environ.get('PORT', 8080))
TARGET_REPO_OWNER = os.environ.get('GITHUB_OWNER', 'pat333-ux')
CLOUD_RUN_URL = os.environ.get('SERVICE_URL', 'https://beastsystem-70875693050.us-central1.run.app')

app = Flask(__name__)

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """Verifies HMAC SHA-256 signature from incoming GitHub webhooks."""
    if not signature_header or not signature_header.startswith('sha256='):
        return False
    hash_object = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        msg=payload_body,
        digestmod=hashlib.sha256
    )
    expected_signature = f"sha256={hash_object.hexdigest()}"
    return hmac.compare_digest(expected_signature, signature_header)

async def dispatch_system_bus_event(event_type: str, repo_name: str, payload: dict):
    """Dispatches payload to internal BEAST System 3.0 modules."""
    logger.info(f"⚡ [BEAST System Bus] Processing event '{event_type}' from repository '{repo_name}'")
    
    # Internal logic mapping for BEAST 3.0 Repositories
    if event_type == 'push':
        ref = payload.get('ref', '')
        commit_hash = payload.get('after', '')
        logger.info(f"✅ Executing deployment sync for branch '{ref}' [Commit: {commit_hash[:7]}]")
    elif event_type == 'pull_request':
        action = payload.get('action', '')
        pr_number = payload.get('number', '')
        logger.info(f"🔄 Pull Request #{pr_number} action '{action}' verified.")
    else:
        logger.info(f"ℹ️ Unhandled system event type: {event_type}")

@app.route('/healthz', methods=['GET'])
def health_check():
    """Health check endpoint for GCP Cloud Run container probes."""
    return jsonify({
        "status": "healthy",
        "system": "BEAST System 3.0 Backend",
        "cloud_run_endpoint": CLOUD_RUN_URL
    }), 200

@app.route('/api/v1/webhooks/github', methods=['POST'])
def github_webhook_handler():
    """Main Webhook Hook Receiver from pat333-ux GitHub Organizations."""
    signature = request.headers.get('X-Hub-Signature-256')
    event_type = request.headers.get('X-GitHub-Event', 'ping')
    
    # Validate Webhook Security Signature
    if not verify_signature(request.data, signature):
        logger.warning("Unauthorized access attempt: Invalid HMAC signature.")
        return jsonify({"error": "Unauthorized signature validation failed."}), 401

    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Invalid payload body."}), 400

    # Ping event verification
    if event_type == 'ping':
        zen = payload.get('zen', '')
        logger.info(f"GitHub Hook Ping received: {zen}")
        return jsonify({"status": "connected", "message": "Hook established successfully."}), 200

    # Execute system bus event handling asynchronously
    repo_full_name = payload.get('repository', {}).get('full_name', '')
    asyncio.run(dispatch_system_bus_event(event_type, repo_full_name, payload))

    return jsonify({
        "status": "success",
        "event": event_type,
        "repository": repo_full_name,
        "service": "BEAST System Cloud Hook Engine"
    }), 200

if __name__ == '__main__':
    logger.info(f"Starting BEAST System Engine on port {PORT}")
    app.run(host='0.0.0.0', port=PORT)
