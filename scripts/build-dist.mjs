#!/usr/bin/env node
import { existsSync } from 'node:fs';
/**
 * Combine site/ (static design doc) + preview/dist (built React app)
 * into a unified dist/ directory for Cloudflare Pages.
 */
import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const site = resolve(root, 'site');
const previewBuild = resolve(root, 'preview/dist');

if (!existsSync(previewBuild)) {
  console.error(
    `[build-dist] preview build missing at ${previewBuild}\nrun \`pnpm build:preview\` first`,
  );
  process.exit(1);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(site, dist, { recursive: true });
await cp(previewBuild, resolve(dist, 'preview'), { recursive: true });

console.log('[build-dist] dist/ assembled (site/ + preview/)');
