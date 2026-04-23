require('dotenv').config();

function readEnv(key, { trim = true } = {}) {
  const value = process.env[key];
  if (value == null) return value;
  return trim ? value.trim() : value;
}

const required = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'FRONTEND_URL', 'SESSION_SECRET'];
for (const key of required) {
  const value = readEnv(key);
  if (!value) throw new Error(`Missing required env var: ${key}`);
}

module.exports = {
  port: Number(readEnv('PORT', { trim: false }) || 4000),
  frontendUrl: readEnv('FRONTEND_URL'),
  jwtSecret: readEnv('JWT_SECRET'),
  xClientId: readEnv('X_CLIENT_ID'),
  xClientSecret: readEnv('X_CLIENT_SECRET'),
  xCallbackUrl: readEnv('X_CALLBACK_URL'),
  supabaseUrl: readEnv('SUPABASE_URL'),
  supabaseServiceKey: readEnv('SUPABASE_SERVICE_KEY'),
  sessionSecret: readEnv('SESSION_SECRET'),
  redisUrl: readEnv('REDIS_URL'),
  nodeEnv: readEnv('NODE_ENV') || 'development'
};
