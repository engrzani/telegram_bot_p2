"""
Amazon Flex Bot - Simple API Version
Handles bot operations for multiple users
"""

import threading
import time
import logging
import json
import os
from datetime import datetime
from dataclasses import dataclass
from typing import Dict, Optional
import requests
from flask import Flask, request, jsonify

# Configuration
NODE_API = "http://localhost:3000"
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")

# Create logs directory if it doesn't exist
os.makedirs(LOG_DIR, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "bot.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class BotConfig:
    """Per-user bot configuration"""
    user_id: int
    auto_accept: bool = False
    min_block_value: float = 0.0
    bot_token: str = ""
    proxy: Optional[Dict] = None
    captcha_service: str = ""
    captcha_api_key: str = ""

class FlexBot:
    """Amazon Flex automation bot for a single user"""
    
    def __init__(self, config: BotConfig):
        self.config = config
        self.running = False
        self.thread: Optional[threading.Thread] = None
        self.session_active = False
        self.last_check = None
        logger.info(f"Bot initialized for user {config.user_id}")
    
    def start(self):
        """Start the bot monitoring"""
        if self.running:
            logger.warning(f"Bot already running for user {self.config.user_id}")
            return False
            
        # Check license status
        if not self._check_license():
            logger.error(f"License check failed for user {self.config.user_id}")
            return False
        
        self.running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        logger.info(f"Bot started for user {self.config.user_id}")
        return True
    
    def stop(self):
        """Stop the bot"""
        if not self.running:
            return False
            
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info(f"Bot stopped for user {self.config.user_id}")
        return True
    
    def is_running(self) -> bool:
        """Check if bot is running"""
        return self.running
    
    def get_status(self) -> Dict:
        """Get bot status"""
        return {
            "user_id": self.config.user_id,
            "is_running": self.running,
            "session_active": self.session_active,
            "last_check": self.last_check.isoformat() if self.last_check else None
        }
    
    def _check_license(self) -> bool:
        """Check if user license is active"""
        try:
            response = requests.get(
                f"{NODE_API}/api/bot/license-status/{self.config.user_id}",
                timeout=5
            )
            data = response.json()
            return data.get('active', False)
        except Exception as e:
            logger.error(f"License check error for user {self.config.user_id}: {e}")
            return False
    
    def _run_loop(self):
        """Main bot monitoring loop"""
        logger.info(f"Bot loop started for user {self.config.user_id}")
        
        while self.running:
            try:
                # Check license periodically
                if not self._check_license():
                    logger.warning(f"License inactive for user {self.config.user_id}, stopping bot")
                    self.running = False
                    break
                
                # Monitor Amazon Flex blocks
                self._monitor_blocks()
                
                self.last_check = datetime.now()
                
                # Wait before next check (5 seconds for testing, adjust as needed)
                time.sleep(5)
                
            except Exception as e:
                logger.error(f"Error in bot loop for user {self.config.user_id}: {e}")
                time.sleep(10)
        
        logger.info(f"Bot loop ended for user {self.config.user_id}")
    
    def _monitor_blocks(self):
        """Monitor and process delivery blocks"""
        # TODO: Implement actual Amazon Flex monitoring logic
        # This is where you'll add:
        # 1. Selenium/Playwright web automation
        # 2. Check for available blocks
        # 3. Parse block details (location, time, payment)
        # 4. Auto-accept based on rules
        # 5. Handle CAPTCHAs
        # 6. Log results to Node.js API
        
        # Placeholder: Log to Node.js API
        try:
            # Simulate finding a block (remove in production)
            if hasattr(self, '_test_logged'):
                return
            
            self._test_logged = True
            
            # Log to Node.js
            requests.post(
                f"{NODE_API}/api/bot/log",
                json={
                    "user_id": self.config.user_id,
                    "action": "bot_monitoring",
                    "details": "Bot is actively monitoring for blocks",
                    "timestamp": datetime.now().isoformat()
                },
                timeout=5
            )
            
        except Exception as e:
            logger.error(f"Monitor error for user {self.config.user_id}: {e}")

class BotManager:
    """Manage multiple user bot instances"""
    
    def __init__(self):
        self.user_bots: Dict[int, FlexBot] = {}
        logger.info("Bot Manager initialized")
    
    def start_bot(self, user_id: int, config: BotConfig) -> bool:
        """Start bot for a user"""
        if user_id in self.user_bots and self.user_bots[user_id].is_running():
            logger.warning(f"Bot already running for user {user_id}")
            return False
        
        bot = FlexBot(config)
        if bot.start():
            self.user_bots[user_id] = bot
            return True
        return False
    
    def stop_bot(self, user_id: int) -> bool:
        """Stop bot for a user"""
        if user_id not in self.user_bots:
            logger.warning(f"No bot found for user {user_id}")
            return False
        
        return self.user_bots[user_id].stop()
    
    def get_bot_status(self, user_id: int) -> Optional[Dict]:
        """Get status of user's bot"""
        if user_id not in self.user_bots:
            return None
        return self.user_bots[user_id].get_status()

# Flask API
app = Flask(__name__)
bot_manager = BotManager()

@app.route('/bot/start', methods=['POST'])
def start_bot():
    """Start bot for user"""
    try:
        data = request.json
        user_id = data.get('userId')
        config_data = data.get('config', {})
        
        if not user_id:
            return jsonify({"error": "Missing userId"}), 400
        
        # Create bot configuration
        config = BotConfig(
            user_id=user_id,
            auto_accept=config_data.get('auto_accept', False),
            min_block_value=config_data.get('min_block_value', 0.0),
            bot_token=config_data.get('bot_token', ''),
            proxy=config_data.get('proxy'),
            captcha_service=config_data.get('captcha_service', ''),
            captcha_api_key=config_data.get('captcha_api_key', '')
        )
        
        if bot_manager.start_bot(user_id, config):
            return jsonify({"success": True, "message": "Bot started"})
        else:
            return jsonify({"error": "Failed to start bot"}), 500
            
    except Exception as e:
        logger.error(f"Start bot error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/bot/stop', methods=['POST'])
def stop_bot():
    """Stop bot for user"""
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "Missing userId"}), 400
        
        if bot_manager.stop_bot(user_id):
            return jsonify({"success": True, "message": "Bot stopped"})
        else:
            return jsonify({"error": "Bot not found or already stopped"}), 404
            
    except Exception as e:
        logger.error(f"Stop bot error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/bot/status/<int:user_id>', methods=['GET'])
def get_status(user_id):
    """Get bot status for user"""
    try:
        status = bot_manager.get_bot_status(user_id)
        if status:
            return jsonify(status)
        else:
            return jsonify({
                "user_id": user_id,
                "is_running": False,
                "session_active": False,
                "last_check": None
            })
            
    except Exception as e:
        logger.error(f"Get status error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        "status": "online",
        "active_bots": len([b for b in bot_manager.user_bots.values() if b.is_running()])
    })

def main():
    """Main entry point"""
    logger.info("=" * 50)
    logger.info("Amazon Flex Bot API Server")
    logger.info("=" * 50)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == "__main__":
    main()
