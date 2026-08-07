#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env if present
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    // Remove surrounding quotes if present
    value = value.replace(/^["'](.*)["']$/, '$1');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Build DATABASE_URL from separate DB_* variables if DATABASE_URL is not set
if (!process.env.DATABASE_URL && process.env.DB_HOST) {
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '3306';
  const database = process.env.DB_NAME || 'section_factory';
  process.env.DATABASE_URL = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${encodeURIComponent(host)}:${port}/${encodeURIComponent(database)}`;
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

// Tell remix-serve which build to serve
process.argv[2] = process.argv[2] || path.resolve(__dirname, 'build/server/index.js');

await import('@remix-run/serve/dist/cli.js');
