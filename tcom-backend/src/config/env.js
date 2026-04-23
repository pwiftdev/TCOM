require('dotenv').config();

const required = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'FRONTEND_URL', 'SESSION_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  xClientId: process.env.X_CLIENT_ID,
  xClientSecret: process.env.X_CLIENT_SECRET,
  xCallbackUrl: process.env.X_CALLBACK_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  sessionSecret: process.env.SESSION_SECRET,
  redisUrl: process.env.REDIS_URL,
  nodeEnv: process.env.NODE_ENV || 'development'
};
