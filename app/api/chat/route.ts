// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('\x1b[36m%s\x1b[0m', '[API] POST /api/chat called');

  const body = await req.json();
  const { messages } = body;

  console.log('\x1b[33m%s\x1b[0m', 'Incoming messages:', messages);

  const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
    }),
  });

  if (!openaiRes.ok) {
    const error = await openaiRes.json();
    console.error('\x1b[31m%s\x1b[0m', ' OpenAI API Error:', error);
    return NextResponse.json({ error }, { status: openaiRes.status });
  }

  const result = await openaiRes.json();

  if (result.usage) {
    console.log('\x1b[32m%s\x1b[0m', ' OpenAI Token Usage:', result.usage);
  }

  const content = result.choices?.[0]?.message?.content;
  console.log('\x1b[34m%s\x1b[0m', ' Assistant response preview:', content?.slice(0, 60) + '...');

  return NextResponse.json({
    role: 'assistant',
    content,
  });
}