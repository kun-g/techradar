import { NextResponse } from 'next/server';
import { getRadarConfigById, getDefaultRadarConfig } from '@/lib/data';
import { getLogsWithLlmResult } from '@/lib/sqlite-db';

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
    const { searchParams } = new URL(request.url);
    const radarId = searchParams.get('radar_id');

    const radarConfig = radarId
      ? getRadarConfigById(radarId)
      : getDefaultRadarConfig();

    if (!radarConfig) {
      return NextResponse.json(
        { error: `未找到ID为 ${radarId} 的雷达配置` },
        { status: 400 }
      );
    }

    const logsWithLLM = getLogsWithLlmResult(radarConfig.id);

    const qas = logsWithLLM.map(log => ({
      name: log.Name || '',
      description: log.Description || '',
      llmResult: log.LLMResult || '',
    }));

    const exportData: ExportedData = {
      prompt: process.env.DEEPSEEK_PROMPT || '未设置提示词',
      radarId: radarConfig.id,
      radarName: radarConfig.name,
      qas,
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
