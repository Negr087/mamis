import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, weekNumber } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Sos un asistente médico amigable que explica análisis clínicos de embarazo en lenguaje simple y cálido, en español argentino.

La paciente está en la semana ${weekNumber || 'desconocida'} de embarazo.

Analizá los siguientes resultados de laboratorio y explicá:
1. Qué significa cada valor en términos simples
2. Si los valores están dentro del rango normal para una embarazada en esa semana
3. Si hay algo que requiera atención (sin alarmar innecesariamente)

IMPORTANTE: Siempre aclarás que esta es una orientación general y que debe consultar con su médico obstetra para una interpretación profesional.

Usá emojis para hacerlo más amigable y organizá la respuesta con secciones claras.

Resultados del análisis:
${text}`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiText = data.content?.[0]?.text || 'No se pudo generar el análisis.';

    return NextResponse.json({ summary: aiText });
  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}