// Verify triggers are installed
import mysql from 'mysql2/promise';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const config = {
  host: envVars.DB_HOST || 'localhost',
  port: parseInt(envVars.DB_PORT || '3307'),
  user: envVars.DB_USER,
  password: envVars.DB_PASSWORD,
  database: envVars.DB_NAME,
};

async function verifyTriggers() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    const [triggers] = await connection.query(`
      SHOW TRIGGERS FROM ${config.database}
    `);
    
    console.log('==========================================');
    console.log('Installed Triggers:');
    console.log('==========================================');
    console.log('');
    
    const expectedTriggers = [
      'UpdateBankQuestionCount_Insert',
      'UpdateBankQuestionCount_Delete',
      'UpdateQuestionSavedCount_Insert',
      'UpdateQuestionSavedCount_Delete',
      'PreventDuplicateQuestionSaved',
    ];
    
    const installedTriggers = triggers.map(t => t.Trigger);
    
    expectedTriggers.forEach(name => {
      if (installedTriggers.includes(name)) {
        console.log(`✅ ${name}`);
      } else {
        console.log(`❌ ${name} - NOT FOUND`);
      }
    });
    
    console.log('');
    console.log(`Total triggers installed: ${installedTriggers.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyTriggers();

