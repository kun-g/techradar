import { classifyWithAI } from './ai-classifier';
import { getDb } from './db';
import {
  getAllBlips,
  getAllLogs,
  getBlipById,
  createBlip,
  updateBlip,
  createLog,
  updateLog,
  findLogByName,
  filterValidTags,
  BlipRecord,
} from './sqlite-db';

/**
 * 添加新 blip：创建 log + 立即创建 blip
 */
export async function addBlip(
  logData: {
    name: string;
    quadrant?: string;
    ring: string;
    description: string;
    llmResult?: string;
  },
  radarConfig: any
): Promise<BlipRecord> {
  // 检查是否已存在同名 log
  const existing = findLogByName(radarConfig.id, logData.name);
  if (existing) {
    throw new Error(`已存在名称为 "${logData.name}" 的记录`);
  }

  let quadrant = logData.quadrant;
  let llmResult = logData.llmResult;

  if (!quadrant && process.env.DEEPSEEK_API_KEY) {
    try {
      console.log('AI分类开始', radarConfig.prompt_id);
      const classification = await classifyWithAI(logData.name, logData.description || '', radarConfig.prompt_id);
      quadrant = classification.quadrant;
      llmResult = classification.rawResponse;
    } catch (aiError) {
      console.error('AI分类错误，使用默认分类:', aiError);
      quadrant = '';
    }
  }

  const now = new Date().toISOString();
  const db = getDb();

  const runInTransaction = db.transaction(() => {
    const log = createLog(radarConfig.id, {
      name: logData.name,
      quadrant: quadrant || '',
      ring: logData.ring,
      description: logData.description,
      blipId: '',
      processed: 'Not started',
      created: now,
      llmResult: llmResult || '',
    });

    const newBlip = createBlip(radarConfig.id, {
      name: log.Name,
      quadrant: log.Quadrant,
      ring: logData.ring,
      description: log.Description,
      lastChange: log.ID,
      updated: now,
      tags: filterValidTags(log.Tags, radarConfig.tags),
    });

    updateLog(radarConfig.id, log.ID, {
      Processed: 'Done',
      BlipID: newBlip.ID,
    });

    return newBlip;
  });

  return runInTransaction();
}

/**
 * 编辑 blip：创建 log + 立即更新 blip
 */
export function editBlip(
  blipData: {
    blipId: string;
    name: string;
    quadrant: string;
    ring: string;
    description: string;
    prevRing?: string;
    prevDescription?: string;
    tags?: string[];
    prevTags?: string[];
    aliases?: string[];
    prevAliases?: string[];
  },
  radarConfig: any
): BlipRecord {
  const validTags = filterValidTags(blipData.tags, radarConfig.tags);

  const hasRingChange = blipData.prevRing && blipData.ring !== blipData.prevRing;
  const hasDescriptionChange = blipData.prevDescription && blipData.description !== blipData.prevDescription;
  const hasTagsChange = blipData.prevTags && JSON.stringify(validTags) !== JSON.stringify(blipData.prevTags);
  const hasAliasesChange = blipData.prevAliases && JSON.stringify(blipData.aliases) !== JSON.stringify(blipData.prevAliases);

  if (!hasRingChange && !hasDescriptionChange && !hasTagsChange && !hasAliasesChange) {
    throw new Error('没有检测到任何变化，请至少修改一项内容');
  }

  const now = new Date().toISOString();
  const db = getDb();

  const runInTransaction = db.transaction(() => {
    const currentBlip = getBlipById(radarConfig.id, blipData.blipId);
    if (!currentBlip) {
      throw new Error(`找不到 Blip: ${blipData.blipId}`);
    }

    const log = createLog(radarConfig.id, {
      name: blipData.name,
      quadrant: blipData.quadrant,
      ring: blipData.ring,
      description: blipData.description,
      blipId: blipData.blipId,
      processed: 'Not started',
      created: now,
      tags: validTags,
      aliases: blipData.aliases,
    });

    const changes: Record<string, any> = {
      LastChange: log.ID,
      updated: now,
    };
    if (hasRingChange) changes.Ring = blipData.ring;
    if (hasDescriptionChange) changes.Description = blipData.description;
    if (hasTagsChange) changes.Tags = validTags;
    if (hasAliasesChange) changes.Aliases = blipData.aliases;

    updateBlip(radarConfig.id, blipData.blipId, changes);

    updateLog(radarConfig.id, log.ID, {
      Processed: 'Done',
      PreviousRecord: currentBlip.LastChange,
    });

    return getBlipById(radarConfig.id, blipData.blipId)!;
  });

  return runInTransaction();
}

/**
 * 批量处理未完成的 log（维护用）
 */
export function syncDatabase(radarId: string, radarConfig: any) {
  const blips = getAllBlips(radarId);
  const logs = getAllLogs(radarId);

  for (const log of logs) {
    if (log.Processed === 'Done') continue;

    if (!log.BlipID) {
      const newBlip = createBlip(radarId, {
        name: log.Name,
        quadrant: log.Quadrant,
        ring: 'assess',
        description: log.Description,
        lastChange: log.ID,
        updated: log.created,
        tags: filterValidTags(log.Tags, radarConfig.tags),
        aliases: log.Aliases ? log.Aliases.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      });
      updateLog(radarId, log.ID, { Processed: 'Done', BlipID: newBlip.ID });
    } else {
      const matchedBlip = blips.find(b => b.ID === log.BlipID);
      if (!matchedBlip) {
        console.error('Blip not found:', log);
        continue;
      }

      const changes: Record<string, any> = {};
      let changed = false;

      if (log.Ring !== matchedBlip.Ring) { changes.Ring = log.Ring; changed = true; }
      if (log.Description && log.Description !== matchedBlip.Description) { changes.Description = log.Description; changed = true; }
      if (log.Tags && JSON.stringify(log.Tags) !== JSON.stringify(matchedBlip.Tags)) { changes.Tags = filterValidTags(log.Tags, radarConfig.tags); changed = true; }

      if (changed) {
        changes.LastChange = log.ID;
        changes.updated = log.created;
        updateBlip(radarId, matchedBlip.ID, changes);
        updateLog(radarId, log.ID, { Processed: 'Done', PreviousRecord: matchedBlip.LastChange });
      }
    }
  }

  return { blips: getAllBlips(radarId), logs: getAllLogs(radarId) };
}
