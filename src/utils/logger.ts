// ============================================================================
// logger.ts — the ONE shared logger for the whole framework, built on Winston.
//
// What it does:
//   • timestamps every line in a real timezone (Australia/Sydney) via moment-timezone
//   • writes ERRORS to           logging/error.log   (errors only)
//   • writes normal INFO logs to logging/info.log    (everything EXCEPT errors)
//   • also prints a clean, colourised line to the console (so test steps show)
//
// The `log` helper keeps the same step/api/ui/info/pass API the tests already use,
// so nothing in the specs has to change — the calls now flow through Winston.
// ============================================================================
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import moment from 'moment-timezone';

// timezone is configurable via env, defaults to Sydney (override: LOG_TZ=UTC ...)
const TIMEZONE = process.env.LOG_TZ ?? 'Australia/Sydney';

// all log files live under ./logging (created on first import if missing)
const LOG_DIR = path.resolve(process.cwd(), 'logging');
fs.mkdirSync(LOG_DIR, { recursive: true });

// --- formats ---------------------------------------------------------------

// stamp each record with a Sydney-time timestamp (moment-timezone does the TZ math)
const timezoned = winston.format((info) => {
  info.timestamp = moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return info;
});

// keep ONLY a given level (used so error.log holds errors and nothing else)
const onlyLevel = (level: string) =>
  winston.format((info) => (info.level === level ? info : false))();

// drop a given level (used so info.log holds everything EXCEPT errors)
const exceptLevel = (level: string) =>
  winston.format((info) => (info.level === level ? false : info))();

// plain text for files:  2026-07-21 09:15:03.123 +10:00 [INFO] message
const fileFormat = winston.format.combine(
  timezoned(),
  winston.format.errors({ stack: true }), // if an Error is passed, log its stack
  winston.format.printf(({ timestamp, level, message, stack }) =>
    `${timestamp} [${level.toUpperCase()}] ${stack || message}`),
);

// colourised, compact line for the terminal
const consoleFormat = winston.format.combine(
  timezoned(),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message }) =>
    `${timestamp} ${level}: ${message}`),
);

// --- the Winston logger ----------------------------------------------------

const logger = winston.createLogger({
  level: 'debug', // capture everything; each transport filters what it keeps
  transports: [
    // 1) errors only  ->  logging/error.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: winston.format.combine(onlyLevel('error'), fileFormat),
    }),
    // 2) normal info (everything EXCEPT errors)  ->  logging/info.log
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'info.log'),
      format: winston.format.combine(exceptLevel('error'), fileFormat),
    }),
    // 3) human-readable console
    new winston.transports.Console({ format: consoleFormat }),
  ],
});

// --- the friendly `log` API the tests use ----------------------------------
// (same shape as before — step/api/ui/info/pass — now backed by Winston)

export const log = {
  // a numbered step inside a test
  step: (n: number, message: string) => logger.info(`STEP ${n}: ${message}`),

  // an API action a helper is performing
  api: (message: string) => logger.info(`  -> [API] ${message}`),

  // a UI action a page object is performing
  ui: (message: string) => logger.info(`  -> [UI] ${message}`),

  // a plain note
  info: (message: string) => logger.info(message),

  // a warning
  warn: (message: string) => logger.warn(message),

  // an error — pass the Error too and its stack is written to error.log
  error: (message: string, err?: unknown) =>
    logger.error(err instanceof Error ? `${message} :: ${err.stack}` : message),

  // a test finished successfully
  pass: (message: string) => logger.info(`PASS ${message}`),

  // low-level debug
  debug: (message: string) => logger.debug(message),
};

export default logger;
