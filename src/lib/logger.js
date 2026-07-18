const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args) => isDev && console.log('[DEBUG]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};
