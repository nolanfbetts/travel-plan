#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Running production database migrations...');

try {
  // Run Prisma migrations
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Database migrations completed successfully!');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
} 