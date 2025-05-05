// LLM判断技术象限的提示词
const PROMPT = `你是一个技术战略专家，负责协助构建组织的技术雷达。

技术雷达包含以下四个象限，请根据我提供的技术项描述，判断该项应归属哪一个象限，并以 JSON 格式返回结果。

象限定义如下：

1. **技术**：软件开发中的方法论或实践方式，例如持续集成、领域驱动设计、代码审查、蓝绿部署等。
2. **工具**：为开发、测试、部署等过程提供支持的软件工具或服务，如命令行工具、监控平台、IDE 插件、构建系统等。
3. **平台**：承载和运行应用的基础设施或运行环境，如 Kubernetes、AWS、iOS、Vercel、Docker 等。
4. **语言与框架**：用于构建应用核心逻辑的编程语言、开发框架、UI 框架等，如 JavaScript、React、Tailwind CSS、Spring Boot 等。

输出格式要求如下：
\`\`\`json
{
  "象限": "技术 | 工具 | 平台 | 语言与框架",
  "理由": "一句话说明分类依据"
}
\`\`\`
如无法确定，请选择最核心用途对应的象限。

以下是待分类项：

名称：{{name}}
描述：{{description}}`;

export interface ClassificationResult {
  quadrant: string;
  reason: string;
  rawResponse: string;
}

/**
 * 使用DeepSeek对技术进行象限分类
 * @param name 技术名称
 * @param description 技术描述
 * @returns 分类结果，包含象限、理由和原始响应
 */
export async function classifyWithAI(name: string, description: string): Promise<ClassificationResult> {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('未配置DeepSeek API密钥');
    }

    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    const prompt = PROMPT
      .replace('{{name}}', name)
      .replace('{{description}}', description || '无详细描述');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // 使用DeepSeek模型
        messages: [
          { role: 'system', content: '你是一个技术雷达分类专家。请以JSON格式回复。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API错误: ${errorData.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI未返回有效内容');
    }

    // 提取JSON部分
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/{[\s\S]*?}/);
    
    if (!jsonMatch) {
      throw new Error('无法从AI回复中提取JSON数据');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonStr);

    return {
      quadrant: result.象限,
      reason: result.理由,
      rawResponse: content
    };
  } catch (error) {
    console.error('调用AI分类API出错:', error);
    throw error;
  }
} 