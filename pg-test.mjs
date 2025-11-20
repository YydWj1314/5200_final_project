import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const caBundle = fs.readFileSync(
  path.join(process.cwd(), 'certs', 'supabase-ca-bundle.crt'),
  'utf8',
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { ca: caBundle }, // 用完整证书链
  max: 1,
});

try {
  const { rows } = await pool.query('select now()');
  console.log('✅ OK:', rows[0]);
} catch (e) {
  console.error('❌ ERR:', e);
} finally {
  await pool.end();
}
