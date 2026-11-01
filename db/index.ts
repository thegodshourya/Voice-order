import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let sqlite: DatabaseSync | undefined;
export function getDb() {
  if (!sqlite) {
    const path = process.env.DATABASE_PATH || './data/orders.sqlite';
    mkdirSync(dirname(path), { recursive: true });
    sqlite = new DatabaseSync(path);
    sqlite.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, table_label TEXT NOT NULL,
      cart TEXT NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'Queued',
      created_at INTEGER NOT NULL
    )`);
  }
  const database = sqlite;
  return drizzle(async (sql, params, method) => {
    const statement = database.prepare(sql);
    if (method === 'run') { statement.run(...params); return { rows: [] }; }
    const rows = statement.all(...params).map(row => Object.values(row));
    return { rows: method === 'get' ? rows[0] : rows };
  }, { schema });
}
