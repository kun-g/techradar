import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { getRadarConfigById, getDefaultRadarConfig } from '@/lib/data';
import fs from 'fs';

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 定义导出数据的接口
interface ExportedData {
  prompt: string;
  radarId: string;
  radarName: string;
  qas: Array<{
    name: string;
    description: string;
    llmResult: string;
  }>;
}

export async function GET(request: Request) {
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

    // 筛选出有llmResult的日志
    const logsWithLLM = logs.filter((log: any) => log.LLMResult);

    // 构建QA数据
    const qas = logsWithLLM.map((log: any) => ({
      name: log.Name || '',
      description: log.Description || '',
      llmResult: log.LLMResult || ''
    }));

    // 构建导出数据
    const exportData: ExportedData = {
      prompt: process.env.DEEPSEEK_PROMPT || '未设置提示词',
      radarId: radarConfig.id,
      radarName: radarConfig.name,
      qas
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('导出Prompt数据时出错:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
} 