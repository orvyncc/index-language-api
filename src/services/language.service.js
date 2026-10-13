const path = require('path');
const fs = require('fs');

const SUPPORTED_LANGUAGES = ['EN', 'ES'];
const DEFAULT_LANGUAGE = 'EN';

const localesDir = path.join(__dirname, '../../locales');

/**
 * In-memory store for translation catalogs.
 * Loaded once at startup.
 */
const catalogs = {};

/**
 * Validates a language code.
 * @param {string} lang
 * @returns {boolean}
 */
function isSupportedLanguage(lang) {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang.toUpperCase());
}

/**
 * Validates a translation key to prevent path traversal or invalid access.
 * Keys must match: category.subkey or deeper with dots, alphanumeric + underscore + dots only.
 * @param {string} key
 * @returns {boolean}
 */
function isValidKey(key) {
  if (typeof key !== 'string' || key.length === 0 || key.length > 200) {
    return false;
  }
  // Only allow letters, numbers, underscores and dots. No path separators.
  if (!/^[a-zA-Z0-9_.]+$/.test(key)) {
    return false;
  }
  // Disallow consecutive dots, leading/trailing dots, or empty segments
  if (key.startsWith('.') || key.endsWith('.') || key.includes('..')) {
    return false;
  }
  return true;
}

/**
 * Safely retrieves a nested value from an object using a dot-separated path.
 * @param {object} obj
 * @param {string} keyPath
 * @returns {string|undefined}
 */
function getNestedValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    if (!Object.prototype.hasOwnProperty.call(current, part)) {
      return undefined;
    }
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Loads and validates all locale files into memory.
 * Throws on failure so the process can exit early.
 */
function loadCatalogs() {
  for (const lang of SUPPORTED_LANGUAGES) {
    const filePath = path.join(localesDir, `${lang}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Locale file missing: ${filePath}`);
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Invalid JSON in locale file ${lang}.json: ${err.message}`);
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error(`Locale file ${lang}.json must contain a JSON object`);
    }
    catalogs[lang] = data;
  }

  // Optional: verify that both catalogs have the same set of top-level keys
  const enKeys = Object.keys(catalogs.EN).sort();
  const esKeys = Object.keys(catalogs.ES).sort();
  if (JSON.stringify(enKeys) !== JSON.stringify(esKeys)) {
    console.warn('[language.service] Warning: EN and ES catalogs have different top-level keys');
  }

  console.log(`[language.service] Loaded ${SUPPORTED_LANGUAGES.length} language catalogs into memory`);
}

/**
 * Returns metadata about supported languages.
 */
function getLanguagesInfo() {
  return {
    success: true,
    defaultLanguage: DEFAULT_LANGUAGE,
    languages: [
      { code: 'EN', name: 'English' },
      { code: 'ES', name: 'Español' }
    ]
  };
}

/**
 * Returns the full catalog for a language.
 * @param {string} lang
 * @returns {{ success: boolean, language: string, translations: object } | null}
 */
function getFullCatalog(lang) {
  const code = lang.toUpperCase();
  if (!isSupportedLanguage(code)) {
    return null;
  }
  return {
    success: true,
    language: code,
    translations: catalogs[code]
  };
}

/**
 * Returns a single translation by key.
 * @param {string} lang
 * @param {string} key
 * @returns {{ success: boolean, language: string, key: string, text: string } | { error: string, status: number }}
 */
function getTranslation(lang, key) {
  const code = (lang || '').toUpperCase();

  if (!isSupportedLanguage(code)) {
    return {
      error: `Unsupported language "${lang}". Available languages are: EN, ES.`,
      status: 400
    };
  }

  if (!isValidKey(key)) {
    return {
      error: 'Invalid translation key format.',
      status: 400
    };
  }

  const text = getNestedValue(catalogs[code], key);
  if (text === undefined) {
    return {
      error: `Translation key "${key}" not found for language ${code}.`,
      status: 404
    };
  }

  return {
    success: true,
    language: code,
    key,
    text
  };
}

module.exports = {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  loadCatalogs,
  getLanguagesInfo,
  getFullCatalog,
  getTranslation,
  isSupportedLanguage,
  isValidKey
};