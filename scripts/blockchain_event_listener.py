import os
import json
import asyncio
import logging
import requests
from web3 import AsyncWeb3
from web3.providers import AsyncHTTPProvider

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s [BEAST_WEB3_BUS]: %(message)s'
)
logger = logging.getLogger('BEAST_WEB3_LISTENER')

# Environment Configuration
RPC_URL = os.environ.get('WEB3_RPC_URL', 'https://ethereum-sepolia.publicnode.com')
CONTRACT_ADDRESS = os.environ.get('BEAST_SYSTEM_BUS_ADDRESS', '0x0000000000000000000000000000000000000000')
BACKEND_ENDPOINT = os.environ.get('SERVICE_URL', 'https://beastsystem-70875693050.us-central1.run.app') + '/api/v1/webhooks/github'
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL_SECONDS', 10))

# Contract ABI definition for SystemEventEmitted
BEAST_SYSTEM_BUS_ABI = json.loads('''[
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "bytes32", "name": "eventId", "type": "bytes32"},
            {"indexed": true, "internalType": "string", "name": "moduleName", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "eventType", "type": "string"},
            {"indexed": false, "internalType": "bytes", "name": "payload", "type": "bytes"},
            {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"indexed": true, "internalType": "address", "name": "caller", "type": "address"}
        ],
        "name": "SystemEventEmitted",
        "type": "event"
    }
]''')

async def forward_event_to_cloud_backend(event_data: dict):
    """Forwards parsed on-chain events to the BEAST System Cloud Run backend."""
    headers = {'Content-Type': 'application/json', 'X-BEAST-Source': 'Ethereum-SystemBus'}
    payload = {
        "source": "BEASTSystemBus.sol",
        "event_id": event_data['eventId'],
        "module_name": event_data['moduleName'],
        "event_type": event_data['eventType'],
        "raw_payload": event_data['payload'],
        "block_timestamp": event_data['timestamp'],
        "caller": event_data['caller']
    }
    
    try:
        response = requests.post(BACKEND_ENDPOINT, json=payload, headers=headers, timeout=10)
        logger.info(f"✅ Dispatched event {event_data['eventId']} to backend. Status: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Failed to dispatch event {event_data['eventId']}: {str(e)}")

async def listen_to_system_bus():
    """Polls the blockchain for BEAST System Bus events asynchronously."""
    w3 = AsyncWeb3(AsyncHTTPProvider(RPC_URL))
    if not await w3.is_connected():
        logger.error("Failed to connect to Ethereum Web3 RPC provider.")
        return

    checksum_address = w3.to_checksum_address(CONTRACT_ADDRESS)
    contract = w3.eth.contract(address=checksum_address, abi=BEAST_SYSTEM_BUS_ABI)
    
    logger.info(f"🌐 Connected to Web3. Listening to BEASTSystemBus at {checksum_address}...")
    
    latest_block = await w3.eth.get_block_number()

    while True:
        try:
            current_block = await w3.eth.get_block_number()
            if current_block > latest_block:
                logger.info(f"Scanning blocks {latest_block + 1} to {current_block}...")
                events = await contract.events.SystemEventEmitted.get_logs(
                    from_block=latest_block + 1,
                    to_block=current_block
                )
                
                for event in events:
                    args = event['args']
                    event_payload = {
                        "eventId": args['eventId'].hex(),
                        "moduleName": args['moduleName'],
                        "eventType": args['eventType'],
                        "payload": args['payload'].hex(),
                        "timestamp": args['timestamp'],
                        "caller": args['caller']
                    }
                    logger.info(f"⚡ Captured On-Chain Event: {args['moduleName']} :: {args['eventType']}")
                    await forward_event_to_cloud_backend(event_payload)

                latest_block = current_block

        except Exception as e:
            logger.error(f"Error reading block log events: {str(e)}")

        await asyncio.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    asyncio.run(listen_to_system_bus())
