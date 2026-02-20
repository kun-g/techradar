import { getDb } from './db';

// DTO 类型 - PascalCase 兼容前端现有逻辑
export interface BlipRecord {
  ID: string;
  Name: string;
  Quadrant: string;
  Ring: string;
  Description: string;
  LastChange: string;
  updated: string;
  Tags: string[];
  Aliases: string;
}

export interface LogRecord {
  ID: string;
  Name: string;
  Quadrant: string;
  Ring: string;
  Description: string;
  BlipID: string;
  Processed: string;
  created: string;
  LLMResult: string;
  Tags: string[];
  Aliases: string;
  PreviousRecord: string;
}

// --- 内部行类型 ---
interface BlipRow {
  rowid: number;
  id: number;
  radar_id: string;
  name: string;
  quadrant: string;
  ring: string;
  description: string;
  last_change: string;
  updated: string;
  tags: string;
  aliases: string;
}

interface LogRow {
  rowid: number;
  id: number;
  radar_id: string;
  name: string;
  quadrant: string;
  ring: string;
  description: string;
  blip_id: string;
  processed: string;
  created: string;
  llm_result: string;
  tags: string;
  aliases: string;
  previous_record: string;
}

function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toBlipRecord(row: BlipRow): BlipRecord {
  return {
    ID: String(row.id),
    Name: row.name,
    Quadrant: row.quadrant,
    Ring: row.ring,
    Description: row.description,
    LastChange: row.last_change,
    updated: row.updated,
    Tags: parseTags(row.tags),
    Aliases: row.aliases,
  };
}

function toLogRecord(row: LogRow): LogRecord {
  return {
    ID: String(row.id),
    Name: row.name,
    Quadrant: row.quadrant,
    Ring: row.ring,
    Description: row.description,
    BlipID: row.blip_id,
    Processed: row.processed,
    created: row.created,
    LLMResult: row.llm_result,
    Tags: parseTags(row.tags),
    Aliases: row.aliases,
    PreviousRecord: row.previous_record,
  };
}

function nextBlipId(radarId: string): number {
  const db = getDb();
  const row = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM blips WHERE radar_id = ?').get(radarId) as { next_id: number };
  return row.next_id;
}

function nextLogId(radarId: string): number {
  const db = getDb();
  const row = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM logs WHERE radar_id = ?').get(radarId) as { next_id: number };
  return row.next_id;
}

// --- Blips CRUD ---

export function getAllBlips(radarId: string): BlipRecord[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM blips WHERE radar_id = ?').all(radarId) as BlipRow[];
  return rows.map(toBlipRecord);
}

export function getBlipById(radarId: string, blipId: string): BlipRecord | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM blips WHERE radar_id = ? AND id = ?').get(radarId, Number(blipId)) as BlipRow | undefined;
  return row ? toBlipRecord(row) : undefined;
}

export function createBlip(radarId: string, data: {
  name: string;
  quadrant: string;
  ring: string;
  description?: string;
  lastChange?: string;
  updated?: string;
  tags?: string[];
  aliases?: string[];
}): BlipRecord {
  const db = getDb();
  const newId = nextBlipId(radarId);
  db.prepare(`
    INSERT INTO blips (id, radar_id, name, quadrant, ring, description, last_change, updated, tags, aliases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    radarId,
    data.name,
    data.quadrant,
    data.ring,
    data.description || '',
    data.lastChange || '',
    data.updated || '',
    JSON.stringify(data.tags || []),
    Array.isArray(data.aliases) ? data.aliases.join(', ') : (data.aliases || '')
  );
  return getBlipById(radarId, String(newId))!;
}

export function updateBlip(radarId: string, blipId: string, changes: Record<string, any>): void {
  const db = getDb();
  const setClauses: string[] = [];
  const values: any[] = [];

  if (changes.Ring !== undefined) { setClauses.push('ring = ?'); values.push(changes.Ring); }
  if (changes.Description !== undefined) { setClauses.push('description = ?'); values.push(changes.Description); }
  if (changes.LastChange !== undefined) { setClauses.push('last_change = ?'); values.push(changes.LastChange); }
  if (changes.updated !== undefined) { setClauses.push('updated = ?'); values.push(changes.updated); }
  if (changes.Tags !== undefined) { setClauses.push('tags = ?'); values.push(JSON.stringify(changes.Tags)); }
  if (changes.Aliases !== undefined) {
    const aliasStr = Array.isArray(changes.Aliases) ? changes.Aliases.join(', ') : changes.Aliases;
    setClauses.push('aliases = ?');
    values.push(aliasStr);
  }

  if (setClauses.length === 0) return;

  values.push(radarId, Number(blipId));
  db.prepare(`UPDATE blips SET ${setClauses.join(', ')} WHERE radar_id = ? AND id = ?`).run(...values);
}

// --- Logs CRUD ---

export function getAllLogs(radarId: string): LogRecord[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM logs WHERE radar_id = ?').all(radarId) as LogRow[];
  return rows.map(toLogRecord);
}

export function getLogById(radarId: string, logId: string): LogRecord | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM logs WHERE radar_id = ? AND id = ?').get(radarId, Number(logId)) as LogRow | undefined;
  return row ? toLogRecord(row) : undefined;
}

export function findLogByName(radarId: string, name: string): LogRecord | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM logs WHERE radar_id = ? AND name = ?').get(radarId, name) as LogRow | undefined;
  return row ? toLogRecord(row) : undefined;
}

export function createLog(radarId: string, data: {
  name: string;
  quadrant?: string;
  ring: string;
  description?: string;
  blipId?: string;
  processed?: string;
  created?: string;
  llmResult?: string;
  tags?: string[];
  aliases?: string[];
}): LogRecord {
  const db = getDb();
  const newId = nextLogId(radarId);
  db.prepare(`
    INSERT INTO logs (id, radar_id, name, quadrant, ring, description, blip_id, processed, created, llm_result, tags, aliases)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newId,
    radarId,
    data.name,
    data.quadrant || '',
    data.ring,
    data.description || '',
    data.blipId || '',
    data.processed || 'Not started',
    data.created || new Date().toISOString(),
    data.llmResult || '',
    JSON.stringify(data.tags || []),
    Array.isArray(data.aliases) ? data.aliases.join(', ') : ''
  );
  return getLogById(radarId, String(newId))!;
}

export function updateLog(radarId: string, logId: string, changes: Record<string, any>): void {
  const db = getDb();
  const setClauses: string[] = [];
  const values: any[] = [];

  if (changes.Processed !== undefined) { setClauses.push('processed = ?'); values.push(changes.Processed); }
  if (changes.BlipID !== undefined) { setClauses.push('blip_id = ?'); values.push(changes.BlipID); }
  if (changes.PreviousRecord !== undefined) { setClauses.push('previous_record = ?'); values.push(changes.PreviousRecord); }
  if (changes.LLMResult !== undefined) { setClauses.push('llm_result = ?'); values.push(changes.LLMResult); }

  if (setClauses.length === 0) return;

  values.push(radarId, Number(logId));
  db.prepare(`UPDATE logs SET ${setClauses.join(', ')} WHERE radar_id = ? AND id = ?`).run(...values);
}

export function clearLlmResults(radarId: string): number {
  const db = getDb();
  const result = db.prepare("UPDATE logs SET llm_result = '' WHERE radar_id = ? AND llm_result != ''").run(radarId);
  return result.changes;
}

export function getLogsWithLlmResult(radarId: string): LogRecord[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM logs WHERE radar_id = ? AND llm_result != ''").all(radarId) as LogRow[];
  return rows.map(toLogRecord);
}

// --- 辅助 ---

export function filterValidTags(tags: string[] | undefined, validTagsList: string[] | undefined): string[] {
  if (!tags || !validTagsList) return [];
  return tags.filter(tag => validTagsList.includes(tag));
}
