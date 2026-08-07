#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const isReset = process.argv.includes('--reset');

function stripQuotes(value) {
  if (
    typeof value === 'string' &&
    value.length > 1 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

// Load .env if present
const envPath = path.resolve(root, '.env');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    value = stripQuotes(value);
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Strip surrounding quotes from environment variables set by hosting panel
for (const key of Object.keys(process.env)) {
  if (process.env[key] !== undefined) {
    process.env[key] = stripQuotes(process.env[key]);
  }
}

// Build DATABASE_URL from separate DB_* variables
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '3306';
  const database = process.env.DB_NAME || 'section_factory';
  process.env.DATABASE_URL = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${port}/${encodeURIComponent(database)}`;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL or DB_HOST is required to run migrations');
  process.exit(1);
}

const prismaBin = path.resolve(root, 'node_modules/.bin/prisma');

if (isReset) {
  const reset = spawnSync(
    process.execPath,
    [prismaBin, 'migrate', 'reset', '--force', '--skip-generate'],
    {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    },
  );
  process.exit(reset.status ?? 1);
}

const deploy = spawnSync(
  process.execPath,
  [prismaBin, 'migrate', 'deploy'],
  {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  },
);

process.exit(deploy.status ?? 1);
