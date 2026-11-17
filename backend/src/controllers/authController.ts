import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { env } from '../config/env';
import { Admin } from '../models/types';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const result = await query<Admin>(
      'SELECT * FROM admins WHERE email = $1 AND is_active = true',
      [email]
    );

    const admin = result.rows[0];
    if (!admin) {
      res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
      return;
    }

    // Update last login
    await query('UPDATE admins SET last_login_at = NOW() WHERE id = $1', [admin.id]);

    // Audit log
    await query(
      `INSERT INTO audit_logs (admin_id, action, ip_address) VALUES ($1, 'login', $2)`,
      [admin.id, req.ip]
    );

    const payload = { id: admin.id, email: admin.email, name: admin.name };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

    res.json({
      status: 'ok',
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
      data: {
        token,
        admin: { id: admin.id, name: admin.name, email: admin.email },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<Omit<Admin, 'password_hash'>>(
      'SELECT id, name, email, is_active, last_login_at, created_at FROM admins WHERE id = $1',
      [req.admin!.id]
    );
    if (!result.rows[0]) {
      res.status(404).json({ status: 'error', message: 'Admin não encontrado' });
      return;
    }
    res.json({ status: 'ok', admin: result.rows[0], data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
