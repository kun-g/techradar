import { Client } from '@notionhq/client';
import fs from 'fs';

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});


export async function syncDatabase() {
  if (!process.env.NOTION_LOGS_DATABASE_ID || !process.env.NOTION_BLIPS_DATABASE_ID) {
    throw new Error('Notion数据库ID未设置');
  }

  const blips = await queryDatabase(process.env.NOTION_BLIPS_DATABASE_ID);
  const logs = await queryDatabase(process.env.NOTION_LOGS_DATABASE_ID);

  for (const l of logs) {
    if (l.Processed == "Done") {
      continue;
    }
    if (l.BlipID == "") {
      console.log("To be processed: ", l);
      // 向Notion添加Blip
      const blip = await createBlip(l);
      await notion.pages.update({
        page_id: l.notion_page_id,
        properties: {
          Processed: {
            status: {
              name: "Done",
            }
          },
          BlipID: {
            rich_text: [
              { text: { content: parsePageProperties((blip as any).properties).ID } }
            ]
          }
        }
      });
    } else {
      let matchedBlip = blips.find((b) => b.ID == l.BlipID);
      if (!matchedBlip) {
        console.error("Blip not found: ", l);
        continue;
      }
      let changed = false;
      let changedProperties: any = {
          LastChange: {
            rich_text: [
              { text: { content: String(l.ID) } }
            ]
          },
          updated: {
            date: {
              start: l.created
            }
          }
      };
      if (l.Ring != matchedBlip.Ring) {
        changedProperties.Ring = {
          select: {
            name: l.Ring
          }
        }
        changed = true;
      }
      if (l.Description && l.Description != matchedBlip.Description) {
        changedProperties.Description = {
          rich_text: [
            { text: { content: l.Description } }
          ]
        }
        changed = true;
      }
      if (changed) {
        console.log("To be updated: ", l);
        console.log(changedProperties);
        console.log(matchedBlip);
        await notion.pages.update({
          page_id: matchedBlip.notion_page_id,
          properties: changedProperties
        });
        await notion.pages.update({
          page_id: l.notion_page_id,
          properties: {
            Processed: {
              status: {
                name: "Done",
              }
            },
            PreviousRecord: {
              rich_text: [
                { text: { content: matchedBlip.LastChange } }
              ]
            }
          }
        });
      }
    }
  }

  // 保存到本地文件
  fs.writeFileSync('./data/blips.json', JSON.stringify(blips, null, 2));
  fs.writeFileSync('./data/logs.json', JSON.stringify(logs, null, 2));

  return {
    blips,
    logs
  };
}

async function createBlip(log: any) {
  if (!process.env.NOTION_LOGS_DATABASE_ID || !process.env.NOTION_BLIPS_DATABASE_ID) {
    throw new Error('Notion数据库ID未设置');
  }
  return await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_BLIPS_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          { text: { content: log.Name } }
        ]
      },
      Quadrant: {
        select: {
          name: log.Quadrant
        }
      },
      Ring: {
        select: {
          name: "assess"
        }
      },
      Description: {
        rich_text: [
          { text: { content: log.Description } }
        ]
      },
      LastChange: {
        rich_text: [
          { text: { content: String(log.ID) } }
        ]
      },
      updated: {
        date: {
          start: log.created
        }
      }
    }
  });
  
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
 * 获取页面详细信息
 * @param pageId - Notion页面ID
 * @returns 页面详细信息
 */
export async function getPageInfo(pageId: string) {
  try {
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });
    
    return response;
  } catch (error) {
    console.error('获取Notion页面信息时出错:', error);
    throw error;
  }
}

/**
 * 获取页面内容
 * @param blockId - Notion块ID（通常是页面ID）
 * @returns 页面内容
 */
export async function getPageContent(blockId: string) {
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
    });
    
    return response;
  } catch (error) {
    console.error('获取Notion页面内容时出错:', error);
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
 * 解析数据库查询结果
 * @param response - Notion数据库查询响应
 * @returns 处理后的页面对象数组
 */
export function parseDatabaseItems(response: any) {
  if (!response || !response.results || !Array.isArray(response.results)) {
    return [];
  }
  
  return {
    results: response.results.map(parsePage).filter(Boolean),
    has_more: response.has_more || false,
    next_cursor: response.next_cursor || null
  };
}

/**
 * 向Logs数据库添加新的条目
 * @param logData - 包含新Log条目数据的对象
 * @returns 创建的Log条目信息
 */
export async function addLogEntry(logData: {
  name: string;
  quadrant: string;
  ring: string;
  description: string;
}) {
  if (!process.env.NOTION_LOGS_DATABASE_ID) {
    throw new Error('Notion数据库ID未设置');
  }

  try {
    // 查询是否已存在相同名称的条目
    const existingEntries = await queryDatabase(
      process.env.NOTION_LOGS_DATABASE_ID,
      {
        property: "Name",
        title: {
          equals: logData.name
        }
      }
    );

    // 如果存在相同名称的条目，返回错误
    if (existingEntries && existingEntries.length > 0) {
      throw new Error(`已存在名称为 "${logData.name}" 的记录`);
    }

    // 创建新的Log条目
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_LOGS_DATABASE_ID,
      },
      properties: {
        Name: {
          title: [
            { text: { content: logData.name } }
          ]
        },
        Quadrant: {
          select: {
            name: logData.quadrant
          }
        },
        Ring: {
          select: {
            name: logData.ring
          }
        },
        Description: {
          rich_text: [
            { text: { content: logData.description } }
          ]
        },
        BlipID: {
          rich_text: [
            { text: { content: "" } }
          ]
        },
        Processed: {
          status: {
            name: "Not started"
          }
        },
        created: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });

    // 解析并返回创建的Log信息
    const createdLog = parsePage(response);
    
    return createdLog;
  } catch (error) {
    console.error('创建新Log条目时出错:', error);
    throw error;
  }
}