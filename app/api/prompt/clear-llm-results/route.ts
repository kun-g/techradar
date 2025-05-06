import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { getRadarConfigById, getDefaultRadarConfig } from '@/lib/data';
import fs from 'fs';

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 从URL参数中获取radar_id
    const { searchParams } = new URL(request.url);
    const radarId = searchParams.get('radar_id');
    
    // 获取雷达配置
    const radarConfig = radarId 
      ? getRadarConfigById(radarId) 
      : getDefaultRadarConfig();
    
    if (!radarConfig) {
      return NextResponse.json(
        { error: `未找到ID为 ${radarId} 的雷达配置` },
        { status: 400 }
      );
    }

    // 使用雷达配置中的logDB
    const logDbId = radarConfig.log_db;
    if (!logDbId) {
      throw new Error('日志数据库ID未设置');
    }

    // 读取雷达特定的日志文件
    let logs;
    try {
      const logFilePath = `./public/data/${radarConfig.id}_logs.json`;
      const logsContent = fs.readFileSync(logFilePath, 'utf8');
      logs = JSON.parse(logsContent);
    } catch (error) {
      console.error(`读取日志文件失败:`, error);
      throw new Error(`无法读取雷达 ${radarConfig.id} 的日志数据`);
    }

    // 筛选出有llmResult的记录
    const recordsWithLLM = logs.filter((log: any) => log.LLMResult && log.notion_page_id);
    
    // 并发执行所有更新操作
    const results = await Promise.allSettled(
      recordsWithLLM.map(async (log: any) => {
        // 更新Notion页面，清空LLMResult字段
        await notion.pages.update({
          page_id: log.notion_page_id,
          properties: {
            LLMResult: {
              rich_text: [] // 空数组表示清空字段
            }
          }
        });
        
        // 同时更新本地记录
        return log.ID;
      })
    );
    
    // 统计成功和失败的更新数量
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // 更新本地JSON文件
    const updatedLogs = logs.map((log: any) => {
      if (log.LLMResult) {
        return { ...log, LLMResult: undefined };
      }
      return log;
    });
    
    // 保存到雷达特定的日志文件
    fs.writeFileSync(`./public/data/${radarConfig.id}_logs.json`, JSON.stringify(updatedLogs, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      radarId: radarConfig.id,
      radarName: radarConfig.name,
      message: `已清空雷达 "${radarConfig.name}" 的 ${succeeded} 条记录的LLMResult字段，失败 ${failed} 条` 
    });
  } catch (error) {
    console.error('清空LLMResult数据时出错:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
} 