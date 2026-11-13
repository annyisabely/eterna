import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query('SELECT key, value FROM store_settings ORDER BY key ASC');
    const settings: Record<string, string | null> = {};
    for (const row of result.rows) { settings[row.key as string] = row.value as string | null; }
    res.json({ status: 'ok', data: settings });
  } catch (err) { next(err); }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO store_settings (key, value, updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }
    // Audit
    await query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, new_values, ip_address)
       VALUES ($1,'update_settings','store_settings',$2,$3)`,
      [req.admin!.id, JSON.stringify(updates), req.ip]
    );
    res.json({ status: 'ok', message: 'Configurações salvas' });
  } catch (err) { next(err); }
}
