import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'techradar.db');
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const RADAR_IDS = ['tech', 'personal'];

function main() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 删除旧数据库（幂等）
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

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

  const insertBlip = db.prepare(`
    INSERT INTO blips (id, radar_id, name, quadrant, ring, description, last_change, updated, tags, aliases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLog = db.prepare(`
    INSERT INTO logs (id, radar_id, name, quadrant, ring, description, blip_id, processed, created, llm_result, tags, aliases, previous_record)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const radarId of RADAR_IDS) {
    const blipsFile = path.join(DATA_DIR, `${radarId}_blips.json`);
    const logsFile = path.join(DATA_DIR, `${radarId}_logs.json`);

    if (fs.existsSync(blipsFile)) {
      const blips = JSON.parse(fs.readFileSync(blipsFile, 'utf-8'));
      const insertMany = db.transaction((items: any[]) => {
        for (const b of items) {
          const tags = Array.isArray(b.Tags) ? JSON.stringify(b.Tags) : '[]';
          const aliases = typeof b.Aliases === 'string' ? b.Aliases : (Array.isArray(b.Aliases) ? b.Aliases.join(', ') : '');
          insertBlip.run(
            Number(b.ID), radarId, b.Name || '', b.Quadrant || '', b.Ring || '',
            b.Description || '', b.LastChange || '', b.updated || '', tags, aliases
          );
        }
      });
      insertMany(blips);
      console.log(`[${radarId}] 导入 ${blips.length} 条 blips`);
    } else {
      console.log(`[${radarId}] blips 文件不存在: ${blipsFile}`);
    }

    if (fs.existsSync(logsFile)) {
      const logs = JSON.parse(fs.readFileSync(logsFile, 'utf-8'));
      const insertMany = db.transaction((items: any[]) => {
        for (const l of items) {
          const tags = Array.isArray(l.Tags) ? JSON.stringify(l.Tags) : '[]';
          const aliases = typeof l.Aliases === 'string' ? l.Aliases : (Array.isArray(l.Aliases) ? l.Aliases.join(', ') : '');
          insertLog.run(
            Number(l.ID), radarId, l.Name || '', l.Quadrant || '', l.Ring || '',
            l.Description || '', l.BlipID || '', l.Processed || 'Not started',
            l.created || '', l.LLMResult || '', tags, aliases, l.PreviousRecord || ''
          );
        }
      });
      insertMany(logs);
      console.log(`[${radarId}] 导入 ${logs.length} 条 logs`);
    } else {
      console.log(`[${radarId}] logs 文件不存在: ${logsFile}`);
    }
  }

  // 验证
  for (const radarId of RADAR_IDS) {
    const blipCount = (db.prepare('SELECT COUNT(*) as count FROM blips WHERE radar_id = ?').get(radarId) as any).count;
    const logCount = (db.prepare('SELECT COUNT(*) as count FROM logs WHERE radar_id = ?').get(radarId) as any).count;
    console.log(`[${radarId}] 验证: ${blipCount} blips, ${logCount} logs`);
  }

  db.close();
  console.log('迁移完成!');
}

main();
