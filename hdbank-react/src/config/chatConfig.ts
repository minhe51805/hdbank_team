// HDBank ChatBot Configuration
// Environment variables and API settings

export const ChatConfig = {
  // n8n webhook URL from New folder project
  N8N_CHAT_URL: process.env.REACT_APP_N8N_CHAT_URL || 'https://laptop-jfecre1c.tail0882b7.ts.net/webhook/2c709ae7-230d-442a-9424-bbcbb8c2bdb0/chat',
  
  // App settings
  APP_NAME: 'HDBank_ChatBot',
  APP_ENV: process.env.REACT_APP_ENV || 'development',
  
  // API settings
  DEFAULT_USER_ID: 'hdbank-web-user',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 2,
  
  // Debug settings
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_REQUESTS: process.env.NODE_ENV === 'development',
};

export default ChatConfig;
