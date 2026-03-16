import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, weekNumber, context } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
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
        max_tokens: 1000,
        system: `Sos "Bumpy", un asistente de embarazo amigable, cálido y en español argentino.
Respondés preguntas sobre el embarazo de forma clara, empática y con emojis.
La usuaria está en la semana ${weekNumber || 'desconocida'} de embarazo.
${context ? `Contexto adicional: ${context}` : ''}

Reglas:
- Siempre aclarás que no reemplazás al médico
- No hacés diagnósticos
- Si algo suena urgente, recomendás ir a la guardia
- Usás un tono cercano y tranquilizador
- Respondés de forma concisa (máximo 3-4 párrafos)
- Usás emojis con moderación para dar calidez`,
        messages: [
          { role: 'user', content: question }
        ],
      }),
    });

    const data = await response.json();
    const answer = data.content?.[0]?.text || 'No pude procesar tu pregunta. Intentá de nuevo.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json({ error: 'Error processing question' }, { status: 500 });
  }
}