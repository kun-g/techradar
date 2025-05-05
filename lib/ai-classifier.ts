import { Langfuse } from "langfuse";
import { randomUUID } from "crypto";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const langfuse = new Langfuse();

// 创建自定义 DeepSeek 实例，确保 API 密钥正确配置
const customDeepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

// LLM判断技术象限的提示词
export const SYSTEM_PROMPT = `你是一个技术战略专家，负责协助构建组织的技术雷达。

请根据我提供的技术项描述，将该项归入下列四个象限之一，并用 JSON 格式返回分类结果和分类理由。

## ⭕️ 四象限定义（经边界强化）

1. **技术**  
   - 定义：软件开发中的方法论、架构风格、流程改进实践。
   - 示例：持续集成、领域驱动设计、微前端、蓝绿部署、特性开关。
   - 判断提示：不依赖特定实现，不是特定工具，而是一种"做事方式"。

2. **工具**  
   - 定义：在开发、测试、构建、协作等流程中，提供具体能力的软件工具或服务。
   - 示例：ESLint、Figma、Ruff、Grafana Loki。
   - **边界强调**：如果该项承担了部署/运行/托管职能，请优先考虑分类为"平台"。

3. **平台**  
   - 定义：用于托管、运行、扩展应用的基础设施与执行环境。
   - 示例：Firebase、Supabase、Kubernetes、边缘函数。
   - 判断提示：是否具备"承载应用运行"能力，而非仅提供开发辅助。

4. **语言与框架**  
   - 定义：用于构建应用核心逻辑的编程语言、开发框架、UI 框架、语法扩展。
   - 示例：TypeScript、React、Tailwind CSS、MDX、React Hooks。

## ⚠️ 判断指引：

- 如描述为"协议、标准或语言规范"，请判断其实际使用中**主要呈现形式**：
  - 若以「开源实现、CLI 工具、服务端组件」为主，归入工具；
  - 若为抽象规范（无主流实现），请避免误归为工具。

- 如描述包含多个角色（例如既是平台又有开发辅助功能），请优先选择**其最核心用途**。

## ✅ 输出格式：
\`\`\`json
{
  "象限": "技术 | 工具 | 平台 | 语言与框架",
  "理由": "一句话说明分类依据"
}
\`\`\`
如无法确定，请选择最核心用途对应的象限。
`;

export const USER_PROMPT = `名称：{{name}}
描述：{{description}}`;

// 兼容旧版API导出，确保导出route.ts能正常工作
export const PROMPT = SYSTEM_PROMPT;

export interface ClassificationResult {
  quadrant: string;
  reason: string;
  rawResponse: string;
}

/**
 * 使用Vercel AI SDK对技术进行象限分类
 * @param name 技术名称
 * @param description 技术描述
 * @returns 分类结果，包含象限、理由和原始响应
 */
export async function classifyWithAI(name: string, description: string): Promise<ClassificationResult> {
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
    
    const generation = trace.generation({
      name: "chat-completion",
      model: "deepseek-chat",
      modelParameters: {
        temperature: 0.3,
        maxTokens: 2000,
      },
      input: [SYSTEM_PROMPT, prompt],
    });

    // 使用Vercel AI SDK的generateText函数进行调用
    const result = await generateText({
      model: customDeepseek('deepseek-chat'),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
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