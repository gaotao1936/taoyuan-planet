import { NextRequest, NextResponse } from 'next/server';

// DeepSeek API is OpenAI-compatible
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '消息不能为空' },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API Key 未配置，请在 .env.local 中设置 DEEPSEEK_API_KEY' },
        { status: 500 }
      );
    }

    const systemMessage = {
      role: 'system',
      content: `你是桃园文创平台的AI助手"小桃"。你专业、友善，擅长回答关于文创产品、传统工艺、艺术设计等方面的问题。
你可以帮助用户：
- 了解文创产品知识和文化背景
- 推荐适合的文创作品
- 解答关于非遗传承和手工艺的问题
- 提供设计灵感和创作建议
请用中文回答，保持热情和专业的语气。`,
    };

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `AI 服务请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices[0]?.message?.content || '抱歉，我没有理解你的问题，请换个方式问吧。',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '服务暂时不可用，请稍后再试' },
      { status: 500 }
    );
  }
}
