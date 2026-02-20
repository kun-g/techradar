import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'techradar.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS blips (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id INTEGER NOT NULL,
      radar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quadrant TEXT NOT NULL,
      ring TEXT NOT NULL,
      description TEXT DEFAULT '',
      last_change TEXT DEFAULT '',
      updated TEXT,
      tags TEXT DEFAULT '[]',
      aliases TEXT DEFAULT '',
      UNIQUE(radar_id, id),
      UNIQUE(radar_id, name)
    );

    CREATE TABLE IF NOT EXISTS logs (
      rowid INTEGER PRIMARY KEY AUTOINCREMENT,
      id INTEGER NOT NULL,
      radar_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quadrant TEXT DEFAULT '',
      ring TEXT NOT NULL,
      description TEXT DEFAULT '',
      blip_id TEXT DEFAULT '',
      processed TEXT DEFAULT 'Not started',
      created TEXT,
      llm_result TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      aliases TEXT DEFAULT '',
      previous_record TEXT DEFAULT '',
      UNIQUE(radar_id, id)
    );
  `);
}
