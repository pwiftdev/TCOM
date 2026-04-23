const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { createClient } = require('redis');
const env = require('./config/env');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

const sessionConfig = {
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'lax' }
};

if (env.redisUrl) {
  const redisClient = createClient({ url: env.redisUrl });
  redisClient.connect().catch(console.error);
  sessionConfig.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionConfig));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', require('./routes/auth'));
app.use('/communities', require('./routes/communities'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/stats', require('./routes/stats'));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(env.port, () => console.log(`TCOM backend listening on ${env.port}`));
