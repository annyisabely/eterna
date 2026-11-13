import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Carrega o .env da raiz do backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { pool } from '../src/config/database';

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administradora Eterna';

  if (!email || !password) {
    console.error('ERRO: ADMIN_EMAIL e ADMIN_PASSWORD devem estar definidos no arquivo .env');
    process.exit(1);
  }

  console.log(`[Seed] Criando/atualizando usuário administrador: ${email}`);

  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO admins (name, email, password_hash, is_active, updated_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (email)
       DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         is_active = true,
         updated_at = NOW()
       RETURNING id, name, email, created_at, updated_at`,
      [name, email.toLowerCase().trim(), passwordHash]
    );

    console.log('[Seed] Administrador configurado com sucesso:');
    console.log({
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
    });

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Falha ao criar administrador:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();

