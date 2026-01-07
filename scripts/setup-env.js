#!/usr/bin/env node
/**
 * Setup .env file from env.example
 * Preserves existing values, sets missing required keys to __REQUIRED__
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const envExamplePath = join(projectRoot, 'env.example');
const envPath = join(projectRoot, '.env');

// Required keys that must have values (not empty)
const REQUIRED_KEYS = [
  'DATABASE_URL',
  'SECRET',
  'USERS_VERIFICATION_TOKEN_SECRET',
  'USERS_RESET_PASSWORD_TOKEN_SECRET',
  'BACKEND_CORS_ORIGINS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'EMAILS_FROM_EMAIL',
  'EMAILS_ENABLED',
  'FRONTEND_URL',
  'VITE_API_URL',
];

// Optional keys (can be empty)
const OPTIONAL_KEYS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'TWITTER_CLIENT_ID',
  'TWITTER_CLIENT_SECRET',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_MODE',
  'PAYPAL_PLAN_ID_PRO',
  'PAYPAL_WEBHOOK_ID',
  'PAYPAL_PLAN_ID_ENTERPRISE',
  'VITE_SUBSCRIPTION_API_URL',
  'EMAILS_FROM_NAME',
];

/**
 * Parse .env file content into key-value pairs
 */
function parseEnv(content) {
  const result = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    const match = trimmed.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      // Remove surrounding quotes if present
      const unquotedValue = value.replace(/^["']|["']$/g, '');
      result[key] = unquotedValue;
    }
  }
  
  return result;
}

/**
 * Format env object back to .env file format
 */
function formatEnv(env, template) {
  const lines = [];
  const templateLines = template.split('\n');
  const usedKeys = new Set();
  
  // Process template lines to preserve comments and structure
  for (const line of templateLines) {
    const trimmed = line.trim();
    
    // Preserve empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      lines.push(line);
      continue;
    }
    
    const match = trimmed.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      usedKeys.add(key);
      
      // Use existing value if present, otherwise use template value, otherwise __REQUIRED__
      let value = env[key];
      if (value === undefined || value === '') {
        const templateValue = match[2].trim().replace(/^["']|["']$/g, '');
        value = templateValue || (REQUIRED_KEYS.includes(key) ? '__REQUIRED__' : '');
      }
      
      lines.push(`${key}=${value}`);
    }
  }
  
  // Add any additional keys from env that aren't in template
  for (const key of Object.keys(env)) {
    if (!usedKeys.has(key)) {
      lines.push(`${key}=${env[key]}`);
    }
  }
  
  return lines.join('\n') + '\n';
}

/**
 * Main setup function
 */
function setupEnv() {
  console.log('🔧 Setting up .env file...\n');
  
  // Read template
  if (!existsSync(envExamplePath)) {
    console.error(`❌ Error: ${envExamplePath} not found!`);
    process.exit(1);
  }
  
  const template = readFileSync(envExamplePath, 'utf-8');
  const templateEnv = parseEnv(template);
  
  // Read existing .env if it exists
  let existingEnv = {};
  if (existsSync(envPath)) {
    console.log('📖 Reading existing .env file...');
    const existingContent = readFileSync(envPath, 'utf-8');
    existingEnv = parseEnv(existingContent);
    console.log(`   Found ${Object.keys(existingEnv).length} existing keys\n`);
  } else {
    console.log('📝 Creating new .env file from template...\n');
  }
  
  // Merge: existing values take precedence
  const mergedEnv = { ...templateEnv, ...existingEnv };
  
  // Check for missing required values
  const missingRequired = [];
  for (const key of REQUIRED_KEYS) {
    if (!mergedEnv[key] || mergedEnv[key] === '' || mergedEnv[key] === '__REQUIRED__') {
      if (!existingEnv[key] || existingEnv[key] === '') {
        mergedEnv[key] = '__REQUIRED__';
        missingRequired.push(key);
      }
    }
  }
  
  // Write merged .env file
  const output = formatEnv(mergedEnv, template);
  writeFileSync(envPath, output, 'utf-8');
  
  console.log('✅ .env file updated successfully!\n');
  
  if (missingRequired.length > 0) {
    console.log('⚠️  The following required keys need to be set:');
    for (const key of missingRequired) {
      console.log(`   - ${key}`);
    }
    console.log('\n📝 Please edit .env and replace __REQUIRED__ with actual values.\n');
  } else {
    console.log('✅ All required keys have values set!\n');
  }
}

// Run setup
setupEnv();