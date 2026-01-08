"""
Amazon Flex Automation Bot - Main Entry Point
Multi-user delivery block monitoring and auto-accept system
"""

import os
import sys
import time
import json
import logging
import asyncio
import requests
from datetime import datetime
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot/logs/bot.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class AmazonFlexBot:
    """Main bot class for Amazon Flex automation"""
    
    def __init__(self, user_id: int, config: Dict):
        self.user_id = user_id
        self.config = config
        self.is_running = False
        self.session = None
        self.api_base_url = config.get('api_base_url', 'http://localhost:3000')
        
        logger.info(f"Bot initialized for user_id: {user_id}")
    
    def check_license_status(self) -> bool:
        """Check if user's license is active"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/bot/license-status/{self.user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                is_active = data.get('active', False)
                logger.info(f"User {self.user_id} license status: {is_active}")
                return is_active
            else:
                logger.error(f"Failed to check license status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking license status: {str(e)}")
            return False
    
    def fetch_user_config(self) -> Dict:
        """Fetch user configuration from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/bot/config/{self.user_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                config = response.json()
                logger.info(f"Fetched config for user {self.user_id}")
                return config
            else:
                logger.error(f"Failed to fetch config: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching config: {str(e)}")
            return {}
    
    def log_to_api(self, action: str, details: str, result: str = 'info'):
        """Send log entry to API"""
        try:
            payload = {
                'user_id': self.user_id,
                'action': action,
                'details': details,
                'result': result,
                'timestamp': datetime.now().isoformat()
            }
            
            requests.post(
                f"{self.api_base_url}/api/bot/log",
                json=payload,
                timeout=5
            )
            
        except Exception as e:
            logger.error(f"Failed to send log to API: {str(e)}")
    
    async def monitor_blocks(self):
        """Main monitoring loop for delivery blocks"""
        logger.info(f"Starting block monitoring for user {self.user_id}")
        self.log_to_api('bot_started', 'Block monitoring started', 'info')
        
        while self.is_running:
            try:
                # Check license status every loop
                if not self.check_license_status():
                    logger.warning(f"License inactive for user {self.user_id}. Stopping bot.")
                    self.log_to_api('bot_stopped', 'License expired or inactive', 'warning')
                    self.stop()
                    break
                
                # TODO: Implement actual block monitoring logic
                # For now, simulate monitoring
                logger.info(f"Monitoring blocks for user {self.user_id}...")
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                self.log_to_api('error', f'Monitoring error: {str(e)}', 'error')
                await asyncio.sleep(60)  # Wait before retry
    
    def start(self):
        """Start the bot"""
        if self.is_running:
            logger.warning(f"Bot already running for user {self.user_id}")
            return False
        
        # Check license before starting
        if not self.check_license_status():
            logger.error(f"Cannot start bot - license inactive for user {self.user_id}")
            self.log_to_api('bot_start_failed', 'License inactive', 'error')
            return False
        
        self.is_running = True
        logger.info(f"Bot started for user {self.user_id}")
        
        # Start monitoring in background
        asyncio.create_task(self.monitor_blocks())
        return True
    
    def stop(self):
        """Stop the bot"""
        if not self.is_running:
            logger.warning(f"Bot not running for user {self.user_id}")
            return False
        
        self.is_running = False
        logger.info(f"Bot stopped for user {self.user_id}")
        self.log_to_api('bot_stopped', 'Bot manually stopped', 'info')
        return True
    
    def get_status(self) -> Dict:
        """Get current bot status"""
        return {
            'user_id': self.user_id,
            'is_running': self.is_running,
            'session_active': self.session is not None,
            'timestamp': datetime.now().isoformat()
        }


# Bot instance manager
bot_instances: Dict[int, AmazonFlexBot] = {}


def get_or_create_bot(user_id: int, config: Dict) -> AmazonFlexBot:
    """Get existing bot instance or create new one"""
    if user_id not in bot_instances:
        bot_instances[user_id] = AmazonFlexBot(user_id, config)
    return bot_instances[user_id]


def main():
    """Main entry point for standalone testing"""
    logger.info("Amazon Flex Bot - Starting in test mode")
    
    # Test configuration
    test_config = {
        'api_base_url': 'http://localhost:3000',
        'user_id': 2  # Demo user
    }
    
    bot = AmazonFlexBot(user_id=2, config=test_config)
    
    # Test license check
    if bot.check_license_status():
        logger.info("✓ License check passed")
        bot.log_to_api('test', 'Bot test completed successfully', 'info')
    else:
        logger.error("✗ License check failed")
    
    logger.info("Bot test completed")


if __name__ == "__main__":
    main()
