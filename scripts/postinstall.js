#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const prismaBin = path.resolve(root, 'node_modules/.bin/prisma');
const result = spawnSync(
  process.execPath,
  [prismaBin, 'generate', '--schema=./prisma/schema.prisma'],
  {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  },
);

process.exit(result.status ?? 0);
