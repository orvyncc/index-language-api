const express = require('express');
const router = express.Router();
const packageJson = require('../../package.json');

/**
 * GET /
 * General API information.
 */
router.get('/', (req, res) => {
  res.json({
    name: 'Index Language API',
    version: packageJson.version,
    status: 'operational',
    description: 'REST API that provides EN and ES translations for the Index Discord bot. Command names remain language-agnostic; only response texts are translated.',
    defaultLanguage: 'EN',
    languages: ['EN', 'ES'],
    endpoints: [
      { method: 'GET', path: '/', description: 'API information' },
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/languages', description: 'List supported languages' },
      { method: 'GET', path: '/languages/:lang', description: 'Full translation catalog for a language (EN or ES)' },
      { method: 'GET', path: '/languages/:lang/:key', description: 'Single translation by key (e.g. errors.no_permission)' }
    ]
  });
});

/**
 * GET /health
 * Simple health check.
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: packageJson.version,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;