import { Client } from '@notionhq/client';
import { parsePage, parsePageProperties } from './notion';

// 定义常见的记录类型
export interface NotionRecord {
  [key: string]: any;
  notion_page_id: string;
}

// 初始化客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 数据库操作类
export class NotionDatabase<T extends NotionRecord = NotionRecord> {
  private dbId: string;
  
  constructor(databaseId: string) {
    this.dbId = databaseId;
  }
  
  // 查询数据
  async query(filter?: any, sorts?: any): Promise<T[]> {
    try {
      const response = await notion.databases.query({
        database_id: this.dbId,
        filter,
        sorts,
      });
      
      return response.results.map(page => ({
        ...parsePageProperties((page as any).properties),
        notion_page_id: page.id
      })) as T[];
    } catch (error) {
      console.error('查询数据库出错:', error);
      throw error;
    }
  }
  
  // 查找单条记录
  async findOne(property: string, value: string): Promise<T | null> {
    const filter = {
      property: property,
      [this.getFilterType(property)]: { equals: value }
    };
    
    const results = await this.query(filter);
    return results.length > 0 ? results[0] : null;
  }
  
  // 判断过滤器类型
  private getFilterType(property: string) {
    // 根据属性名判断类型，可根据实际情况扩展
    if (property === 'Name') return 'title';
    if (['ID', 'BlipID'].includes(property)) return 'rich_text';
    return 'text';
  }
  
  // 创建记录
  async create(data: Record<string, any>) {
    try {
      const properties = this.convertToNotionProperties(data);
      
      const response = await notion.pages.create({
        parent: { database_id: this.dbId },
        properties
      });
      
      return parsePage(response);
    } catch (error) {
      console.error('创建记录出错:', error);
      throw error;
    }
  }
  
  // 更新记录
  async update(pageId: string, data: Record<string, any>) {
    try {
      const properties = this.convertToNotionProperties(data);
      
      const response = await notion.pages.update({
        page_id: pageId,
        properties
      });
      
      return parsePage(response);
    } catch (error) {
      console.error('更新记录出错:', error);
      throw error;
    }
  }
  
  // 将普通对象转换为Notion属性格式
  private convertToNotionProperties(data: Record<string, any>) {
    const properties: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      // 根据属性名和值类型生成对应的Notion属性格式
      if (key === 'Name') {
        properties[key] = {
          title: [{ text: { content: String(value) } }]
        };
      } else if (key === 'Quadrant' || key === 'Ring' || key === 'Status') {
        properties[key] = {
          select: { name: String(value) }
        };
      } else if (key === 'Tags') {
        properties[key] = {
          multi_select: (value as string[]).map(tag => ({ name: tag }))
        };
      } else if (key === 'created' || key === 'updated') {
        properties[key] = {
          date: { start: typeof value === 'string' ? value : new Date(value).toISOString() }
        };
      } else if (key === 'Processed') {
        properties[key] = {
          status: { name: String(value) }
        };
      } else if (Array.isArray(value) && key === 'Aliases') {
        properties[key] = {
          rich_text: [{ text: { content: value.join(', ') } }]
        };
      } else {
        // 默认使用rich_text
        properties[key] = {
          rich_text: [{ text: { content: String(value) } }]
        };
      }
    });
    
    return properties;
  }
}

// 定义特定记录类型
export interface BlipRecord extends NotionRecord {
  ID: string;
  Name: string;
  Quadrant: string;
  Ring: string;
  Description: string;
  LastChange: string;
  Tags?: string[];
  Aliases?: string[];
}

export interface LogRecord extends NotionRecord {
  ID: string;
  Name: string;
  Quadrant: string;
  Ring: string;
  Description: string;
  BlipID: string;
  Processed: string;
  created: string;
  Tags?: string[];
  Aliases?: string[];
}

// 辅助函数
export function filterValidTags(tags: string[] | undefined, validTagsList: string[] | undefined) {
  if (!tags || !validTagsList) return [];
  return tags.filter(tag => validTagsList.includes(tag));
}

// 工厂函数
export function getBlipsDB(radarConfig: any): NotionDatabase<BlipRecord> {
  if (!radarConfig || !radarConfig.blip_db) {
    throw new Error('雷达配置错误或Blips数据库ID未设置');
  }
  return new NotionDatabase<BlipRecord>(radarConfig.blip_db);
}

export function getLogsDB(radarConfig: any): NotionDatabase<LogRecord> {
  if (!radarConfig || !radarConfig.log_db) {
    throw new Error('雷达配置错误或Logs数据库ID未设置');
  }
  return new NotionDatabase<LogRecord>(radarConfig.log_db);
} 