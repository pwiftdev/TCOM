const express = require('express');
const { optionalAuth } = require('../middleware/optionalAuth');
const { getOnlineCount, ONLINE_WINDOW_SECONDS } = require('../services/presence');

const router = express.Router();

router.get('/online', optionalAuth, async (_req, res) => {
  try {
    const online = await getOnlineCount();
    res.set('Cache-Control', 'public, max-age=15');
    return res.json({ online, window_seconds: ONLINE_WINDOW_SECONDS });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Could not read presence' });
  }
});

module.exports = router;
