// Simplified script to run database_triggers.sql
import mysql from 'mysql2/promise';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found');
  process.exit(1);
}

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
  multipleStatements: true,
};

if (!config.user || !config.password || !config.database) {
  console.error('❌ Error: Missing database credentials');
  process.exit(1);
}

console.log('==========================================');
console.log('Installing Database Triggers');
console.log('==========================================');
console.log(`Connecting to: ${config.host}:${config.port}/${config.database}`);
console.log('');

async function runTriggers() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    console.log('');

    // Execute statements directly from SQL file
    const statements = [
      // 1. Add column
      `ALTER TABLE question_banks ADD COLUMN total_questions BIGINT NOT NULL DEFAULT 0`,
      
      // 2. Initialize
      `UPDATE question_banks qb SET total_questions = (SELECT COUNT(*) FROM question_bank_questions qbq WHERE qbq.question_bank_id = qb.id)`,
      
      // 3. Triggers
      `CREATE TRIGGER UpdateBankQuestionCount_Insert AFTER INSERT ON question_bank_questions FOR EACH ROW BEGIN UPDATE question_banks SET total_questions = total_questions + 1 WHERE id = NEW.question_bank_id; END`,
      
      `CREATE TRIGGER UpdateBankQuestionCount_Delete AFTER DELETE ON question_bank_questions FOR EACH ROW BEGIN UPDATE question_banks SET total_questions = GREATEST(total_questions - 1, 0) WHERE id = OLD.question_bank_id; END`,
      
      `CREATE TRIGGER UpdateQuestionSavedCount_Insert AFTER INSERT ON user_question_saved FOR EACH ROW BEGIN UPDATE questions SET saved_count = saved_count + 1 WHERE id = NEW.question_id; END`,
      
      `CREATE TRIGGER UpdateQuestionSavedCount_Delete AFTER DELETE ON user_question_saved FOR EACH ROW BEGIN UPDATE questions SET saved_count = GREATEST(saved_count - 1, 0) WHERE id = OLD.question_id; END`,
      
      `CREATE TRIGGER PreventDuplicateQuestionSaved BEFORE INSERT ON user_question_saved FOR EACH ROW BEGIN IF EXISTS (SELECT 1 FROM user_question_saved WHERE user_id = NEW.user_id AND question_id = NEW.question_id) THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duplicate save: User has already saved this question'; END IF; END`,
    ];

    for (const statement of statements) {
      try {
        if (statement.includes('ALTER TABLE')) {
          console.log('Adding column to question_banks...');
          await connection.query(statement);
          console.log('  ✅ Column added');
        } else if (statement.includes('UPDATE')) {
          console.log('Initializing total_questions...');
          await connection.query(statement);
          console.log('  ✅ Initialized');
        } else if (statement.includes('CREATE TRIGGER')) {
          const match = statement.match(/CREATE TRIGGER\s+(\w+)/i);
          const triggerName = match ? match[1] : 'Unknown';
          console.log(`Creating trigger: ${triggerName}...`);
          await connection.query(statement);
          console.log(`  ✅ ${triggerName} created`);
        }
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('  ⚠️  Column already exists, skipping...');
        } else if (err.code === 'ER_TRG_ALREADY_EXISTS') {
          console.log('  ⚠️  Trigger already exists, skipping...');
        } else {
          console.error(`  ❌ Error: ${err.message}`);
          console.error(`  Error code: ${err.code}`);
          throw err;
        }
      }
    }

    console.log('');
    console.log('==========================================');
    console.log('✅ All triggers installed successfully!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error installing triggers:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('');
      console.log('Connection closed');
    }
  }
}

runTriggers();

