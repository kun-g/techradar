import { NextResponse } from 'next/server';
import logs from '@/data/logs.json';
import { PROMPT } from '@/lib/ai-classifier';

export async function GET(request: Request) {
  try {
    // 筛选出有llmResult的记录
    const recordsWithLLM = logs.filter(log => log.LLMResult);
    
    // 转换为所需格式
    const qas = recordsWithLLM.map(log => ({
      name: log.Name,
      description: log.Description,
      llmResult: log.LLMResult
    }));
    
    // 构建返回数据
    const result = {
      prompt: PROMPT,
      qas
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('导出Prompt数据时出错:', error);
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
} 