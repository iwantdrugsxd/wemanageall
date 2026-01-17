#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function dirname(p) {
  return path.dirname(p);
}

const envContent = `# OFA - Personal Life OS Environment Configuration

# Server
PORT=3000
NODE_ENV=development
SESSION_SECRET=${crypto.randomBytes(32).toString('hex')}

# PostgreSQL Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ofa_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ofa_db
DB_USER=postgres
DB_PASSWORD=password

# Connection pool
DB_POOL_MIN=2
DB_POOL_MAX=10
`;

const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Skipping...');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
  console.log('\n📝 Please update the PostgreSQL credentials in .env\n');
}











