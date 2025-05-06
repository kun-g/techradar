import { Client } from '@notionhq/client';
import fs from 'fs';
import { classifyWithAI } from './ai-classifier';
import { getRadarConfigById, getDefaultRadarConfig } from './data';
import { getBlipsDB, getLogsDB, filterValidTags, BlipRecord, LogRecord } from './notionDB';
// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * 同步指定雷达的Notion数据库
 * @param radarId 雷达ID，不提供则使用默认雷达
 */
export async function syncDatabase(radarId: string) {
  const radarConfig = getRadarConfigById(radarId);
  
  if (!radarConfig) {
    throw new Error(`未找到ID为 ${radarId} 的雷达配置`);
  }

  // 使用数据库API
  const blipsDB = getBlipsDB(radarConfig);
  const logsDB = getLogsDB(radarConfig);
  
  const blips = await blipsDB.query();
  const logs = await logsDB.query();

  for (const log of logs) {
    if (log.Processed === "Done") {
      continue;
    }
    
    if (!log.BlipID) {
      // 创建新的Blip记录
      const blipData = {
        Name: log.Name,
        Quadrant: log.Quadrant,
        Ring: "assess",
        Description: log.Description,
        LastChange: String(log.ID),
        updated: log.created,
        Tags: filterValidTags(log.Tags, radarConfig.tags),
        Aliases: log.Aliases || []
      };
      
      const blipResponse = await blipsDB.create(blipData);
      
      if (blipResponse && blipResponse.properties) {
        const blipProps = blipResponse.properties as any;
        await logsDB.update(log.notion_page_id, {
          Processed: "Done",
          BlipID: blipProps.ID || ''
        });
      }
    } else {
      // 查找匹配的Blip
      const matchedBlip = blips.find(b => b.ID === log.BlipID);
      if (!matchedBlip) {
        console.error("Blip not found: ", log);
        continue;
      }
      
      // 检查并准备更新数据
      const changes: Record<string, any> = {};
      let changed = false;
      
      // 基本变更
      if (log.Ring !== matchedBlip.Ring) {
        changes.Ring = log.Ring;
        changed = true;
      }
      
      if (log.Description && log.Description !== matchedBlip.Description) {
        changes.Description = log.Description;
        changed = true;
      }
      
      // 处理Tags字段更新
      if (log.Tags && JSON.stringify(log.Tags) !== JSON.stringify(matchedBlip.Tags)) {
        changes.Tags = filterValidTags(log.Tags, radarConfig.tags);
        changed = true;
      }
      
      // 处理Aliases字段更新
      if (log.Aliases && log.Aliases.join(', ') !== (matchedBlip.Aliases || []).join(', ')) {
        changes.Aliases = log.Aliases;
        changed = true;
      }
      
      if (changed) {
        // 添加更新日志相关字段
        changes.LastChange = String(log.ID);
        changes.updated = log.created;
        
        // 执行更新
        await blipsDB.update(matchedBlip.notion_page_id, changes);
        await logsDB.update(log.notion_page_id, {
          Processed: "Done",
          PreviousRecord: matchedBlip.LastChange
        });
      }
    }
  }
  
  // 写入雷达特定的文件
  fs.writeFileSync(`./public/data/${radarConfig.id}_blips.json`, JSON.stringify(blips, null, 2));
  fs.writeFileSync(`./public/data/${radarConfig.id}_logs.json`, JSON.stringify(logs, null, 2));

  return { blips, logs };
}

/**
 * 查询Notion数据库
 * @param databaseId - Notion数据库ID
 * @param filter - 可选的过滤条件
 * @param sorts - 可选的排序条件
 * @returns 查询结果
 */
export async function queryDatabase(
  databaseId: string,
  filter?: any,
  sorts?: any
) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
    });

    let results = [];
    for (const page of response.results) {
      let properties = parsePageProperties((page as any).properties);
      properties.notion_page_id = page.id;
      results.push(properties);
    }
    
    return results;
  } catch (error) {
    console.error('查询Notion数据库时出错:', error);
    throw error;
  }
}

/**
 * 解析Notion页面属性
 * @param properties - Notion页面的properties对象
 * @returns 解析后的属性对象，键为属性名，值为解析后的属性值
 */
export function parsePageProperties(properties: any) {
  const result: Record<string, any> = {};

  if (!properties || typeof properties !== 'object') {
    return result;
  }

  // 遍历所有属性
  Object.entries(properties).forEach(([key, property]: [string, any]) => {
    if (!property || !property.type) {
      result[key] = null;
      return;
    }

    // 根据属性类型解析值
    switch (property.type) {
      case 'title':
        result[key] = property.title?.map((t: any) => t.plain_text).join('') || '';
        break;
      
      case 'rich_text':
        result[key] = property.rich_text?.map((t: any) => t.plain_text).join('') || '';
        break;
      
      case 'number':
        result[key] = property.number;
        break;
      
      case 'select':
        result[key] = property.select?.name || null;
        break;
      
      case 'multi_select':
        result[key] = property.multi_select?.map((s: any) => s.name) || [];
        break;
      
      case 'date':
        result[key] = property.date?.start || null;
        break;
      
      case 'checkbox':
        result[key] = property.checkbox;
        break;
      
      case 'url':
        result[key] = property.url;
        break;
      
      case 'email':
        result[key] = property.email;
        break;
      
      case 'phone_number':
        result[key] = property.phone_number;
        break;
      
      case 'relation':
        result[key] = property.relation?.map((r: any) => r.id) || [];
        break;
      
      case 'status':
        result[key] = property.status?.name || null;
        break;
      
      case 'created_time':
        result[key] = property.created_time;
        break;
      
      case 'created_by':
        result[key] = property.created_by?.id || null;
        break;
      
      case 'last_edited_time':
        result[key] = property.last_edited_time;
        break;
      
      case 'last_edited_by':
        result[key] = property.last_edited_by?.id || null;
        break;
      
      case 'formula':
        result[key] = property.formula?.string || 
                     property.formula?.number || 
                     property.formula?.boolean || 
                     property.formula?.date || null;
        break;
      
      case 'rollup':
        if (property.rollup.type === 'array') {
          result[key] = property.rollup.array;
        } else {
          result[key] = property.rollup?.number || null;
        }
        break;
      
      case 'people':
        result[key] = property.people?.map((p: any) => ({ 
          id: p.id, 
          name: p.name,
          avatar_url: p.avatar_url 
        })) || [];
        break;
      
      case 'files':
        result[key] = property.files?.map((f: any) => ({
          name: f.name,
          url: f.file?.url || f.external?.url || null
        })) || [];
        break;

      case 'unique_id':
        result[key] = String(property.unique_id?.number) || null;
        break;
      
      default:
        // 对于其他类型，保留原始数据
        result[key] = property;
    }
  });

  return result;
}

/**
 * 解析带属性的Notion页面数据
 * @param page - Notion页面对象
 * @returns 处理后的页面对象，包含ID、URL和解析后的属性
 */
export function parsePage(page: any) {
  if (!page || !page.id) return null;
  
  return {
    id: page.id,
    url: page.url,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    properties: parsePageProperties(page.properties)
  };
}

/**
 * 向Logs数据库添加新的条目
 * @param logData - 包含新Log条目数据的对象
 * @param radarConfig - 雷达配置
 * @returns 创建的Log条目信息
 */
export async function addLogEntry(logData: {
  name: string;
  quadrant?: string;
  ring: string;
  description: string;
  llmResult?: string;
}, radarConfig: any) {
  // 使用数据库API
  const logsDB = getLogsDB(radarConfig);
  
  try {
    // 查询是否已存在相同名称的条目
    const existingEntry = await logsDB.findOne('Name', logData.name);

    // 如果存在相同名称的条目，返回错误
    if (existingEntry) {
      throw new Error(`已存在名称为 "${logData.name}" 的记录`);
    }

    // 如果未提供象限，尝试使用AI进行分类
    let quadrant = logData.quadrant;
    let llmResult = logData.llmResult;

    if (!quadrant && process.env.DEEPSEEK_API_KEY) {
      try {
        // 调用AI进行分类
        console.log("AI分类开始", radarConfig.prompt_id);
        const classification = await classifyWithAI(logData.name, logData.description || '', radarConfig.prompt_id);
        quadrant = classification.quadrant;
        llmResult = classification.rawResponse;
        
      } catch (aiError) {
        console.error('AI分类错误，使用默认分类:', aiError);
        // AI分类失败时不阻止流程，继续使用空白,之后sync时会自动分类
        quadrant = "";
      }
    }

    // 准备数据对象
    const data: Record<string, any> = {
      Name: logData.name,
      Ring: logData.ring,
      Description: logData.description,
      BlipID: "",
      Processed: "Not started",
      created: new Date().toISOString()
    };

    // 如果有象限，添加到属性中
    if (quadrant && quadrant !== "") {
      data.Quadrant = quadrant;
    }

    // 如果有LLM响应，添加到记录中
    if (llmResult) {
      data.LLMResult = llmResult;
    }

    // 创建新的Log条目
    const createdLog = await logsDB.create(data);
    
    return createdLog;
  } catch (error) {
    console.error('创建新Log条目时出错:', error);
    throw error;
  }
}

/**
 * 创建Blip的修改记录
 * @param blipData - 包含Blip修改数据的对象
 * @param radarConfig - 雷达配置
 * @returns 创建的Log条目信息
 */
export async function createBlipEditLog(blipData: {
  blipId: string;          // 要编辑的Blip ID
  name: string;            // Blip名称
  quadrant: string;        // Blip象限
  ring: string;            // 新的环状态
  description: string;     // 新的描述
  prevRing?: string;       // 之前的环状态
  prevDescription?: string;// 之前的描述
  tags?: string[];         // 标签
  prevTags?: string[];     // 之前的标签
  aliases?: string[];      // 别名
  prevAliases?: string[];  // 之前的别名
}, radarConfig: any) {
  const logsDB = getLogsDB(radarConfig);
  
  try {
    // 过滤掉不在预定义标签列表中的标签
    const validTags = filterValidTags(blipData.tags, radarConfig.tags);
    
    // 检查是否有实际变化
    const hasRingChange = blipData.prevRing && blipData.ring !== blipData.prevRing;
    const hasDescriptionChange = blipData.prevDescription && blipData.description !== blipData.prevDescription;
    const hasTagsChange = blipData.prevTags && JSON.stringify(validTags) !== JSON.stringify(blipData.prevTags);
    const hasAliasesChange = blipData.prevAliases && JSON.stringify(blipData.aliases) !== JSON.stringify(blipData.prevAliases);
    
    if (!hasRingChange && !hasDescriptionChange && !hasTagsChange && !hasAliasesChange) {
      throw new Error('没有检测到任何变化，请至少修改一项内容');
    }

    // 准备数据对象
    const data: Record<string, any> = {
      Name: blipData.name,
      Quadrant: blipData.quadrant,
      Ring: blipData.ring,
      Description: blipData.description,
      BlipID: blipData.blipId,
      Processed: "Not started",
      created: new Date().toISOString()
    };

    // 添加Tags字段（如果有）
    if (validTags.length > 0) {
      data.Tags = validTags;
    }

    // 添加Aliases字段（如果有）
    if (blipData.aliases && blipData.aliases.length > 0) {
      data.Aliases = blipData.aliases;
    }

    // 创建新的Log条目
    const createdLog = await logsDB.create(data);
    
    return createdLog;
  } catch (error) {
    console.error('创建Blip编辑记录时出错:', error);
    throw error;
  }
}