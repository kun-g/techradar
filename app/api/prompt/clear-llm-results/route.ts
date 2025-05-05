import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import logs from '@/data/logs.json';
import fs from 'fs';

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.NOTION_LOGS_DATABASE_ID) {
      throw new Error('Notion数据库ID未设置');
    }

    // 筛选出有llmResult的记录
    const recordsWithLLM = logs.filter(log => log.LLMResult && log.notion_page_id);
    
    // 并发执行所有更新操作
    const results = await Promise.allSettled(
      recordsWithLLM.map(async (log) => {
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
    const updatedLogs = logs.map(log => {
      if (log.LLMResult) {
        return { ...log, LLMResult: undefined };
      }
      return log;
    });
    
    // 保存到本地文件
    fs.writeFileSync('./data/logs.json', JSON.stringify(updatedLogs, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: `已清空 ${succeeded} 条记录的LLMResult字段，失败 ${failed} 条` 
    });
  } catch (error) {
    console.error('清空LLMResult数据时出错:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '处理请求时出错' },
      { status: 500 }
    );
  }
} 