import { Langfuse } from "langfuse";
import { randomUUID } from "crypto";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const langfuse = new Langfuse();

const customDeepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export const USER_PROMPT = `名称：{{name}}
描述：{{description}}`;

export interface ClassificationResult {
  quadrant: string;
  reason: string;
  rawResponse: string;
}

/**
 * 使用Vercel AI SDK对技术进行象限分类
 * @param name 技术名称
 * @param description 技术描述
 * @param promptId 提示ID
 * @returns 分类结果，包含象限、理由和原始响应
 */
export async function classifyWithAI(name: string, description: string, promptId: string): Promise<ClassificationResult> {
  try {
    const prompt = USER_PROMPT
      .replace('{{name}}', name)
      .replace('{{description}}', description || '无详细描述');

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('未配置DeepSeek API密钥');
    }

    const parentId = randomUUID();
    const trace = langfuse.trace({
      name: "AI-技术象限分类",
      id: parentId
    });
    const systemPrompt = await langfuse.getPrompt(promptId);
    const messages : any[] = [
        { role: 'system', content: systemPrompt.prompt },
        { role: 'user', content: prompt }
    ]
    
    const generation = trace.generation({
      name: "chat-completion",
      model: "deepseek-chat",
      prompt: systemPrompt,
      modelParameters: {
        temperature: 0.3,
        maxTokens: 2000,
      },
      input: messages,
    });

    const result = await generateText({
      model: customDeepseek('deepseek-chat'),
      messages: messages,
      temperature: 0.3,
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          langfuseTraceId: parentId,
          langfuseUpdateParent: false
        }
      },
    });

    const content = result.text;

    if (!content) {
      generation.end();
      throw new Error('AI未返回有效内容');
    }
    
    generation.end({ output: content });

    // 提取JSON部分
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/{[\s\S]*?}/);
    
    if (!jsonMatch) {
      throw new Error('无法从AI回复中提取JSON数据');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const jsonResult = JSON.parse(jsonStr);

    return {
      quadrant: jsonResult.象限,
      reason: jsonResult.理由,
      rawResponse: content
    };
  } catch (error) {
    console.error('调用AI分类API出错:', error);
    throw error;
  }
} 