const express = require('express');
const router = express.Router();
const languageService = require('../services/language.service');

/**
 * GET /languages
 * Returns supported languages and the default.
 */
router.get('/', (req, res) => {
  const data = languageService.getLanguagesInfo();
  res.json(data);
});

/**
 * GET /languages/:lang
 * Returns the full catalog for the given language.
 */
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  const result = languageService.getFullCatalog(lang);

  if (!result) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language "${lang}". Available languages are: EN, ES.`
    });
  }

  res.json(result);
});

/**
 * GET /languages/:lang/:key
 * Returns a single translation.
 * The key may contain dots (e.g. errors.no_permission).
 * Express treats the rest of the path as :key when using a wildcard or we capture it carefully.
 *
 * Because keys contain dots, we use a wildcard parameter.
 */
router.get('/:lang/*', (req, res) => {
  const { lang } = req.params;
  // req.params[0] contains everything after /:lang/
  const key = req.params[0];

  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Translation key is required.'
    });
  }

  const result = languageService.getTranslation(lang, key);

  if (result.error) {
    return res.status(result.status).json({
      success: false,
      error: result.error
    });
  }

  res.json(result);
});

module.exports = router;