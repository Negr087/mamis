import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { gender, origin, style, surname } = await request.json();

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
        messages: [
          {
            role: 'user',
            content: `Generá 8 nombres de bebé con las siguientes preferencias:
- Género: ${gender || 'cualquiera'}
- Origen/estilo: ${origin || 'variado'}
- Estilo: ${style || 'moderno pero no demasiado común'}
${surname ? `- Apellido de la familia: ${surname} (tené en cuenta la sonoridad con el apellido)` : ''}

Respondé ÚNICAMENTE con un JSON array válido, sin markdown, sin backticks, sin texto adicional. Cada objeto debe tener:
- "name": el nombre
- "gender": "niño", "niña" o "unisex"
- "origin": origen del nombre
- "meaning": significado breve

Ejemplo de formato exacto:
[{"name":"Luna","gender":"niña","origin":"Latino","meaning":"Luminosa como la luna"}]`
          }
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';

    // Parse JSON safely
    let names;
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      names = JSON.parse(cleaned);
    } catch {
      names = [];
    }

    return NextResponse.json({ names });
  } catch (error) {
    console.error('Name generator error:', error);
    return NextResponse.json({ error: 'Error generating names' }, { status: 500 });
  }
}