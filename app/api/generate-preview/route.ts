import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Lazy-initialize OpenAI client (avoid build-time errors when env var is missing)
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const RequestSchema = z.object({
  generatedPrompt: z.string().min(1, 'Generated prompt is required'),
});

function buildImagePrompt(generatedPrompt: string): string {
  // Truncate if very long — GPT image gen has prompt limits
  const truncated = generatedPrompt.slice(0, 2000);

  return `Generate a professional, high-fidelity website screenshot mockup based on this website specification:

---
${truncated}
---

Render it as a realistic website screenshot displayed inside a modern browser window frame. The design should look like a real, polished, production-ready website. Modern UI with proper typography, spacing, color hierarchy, and realistic placeholder content. Show the full page layout clearly. Clean, crisp rendering.

Style: UI design mockup, web design screenshot, digital illustration. NOT a photograph.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generatedPrompt } = RequestSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const imagePrompt = buildImagePrompt(generatedPrompt);

    console.log('Generating preview image with GPT-4o...');
    console.log('Prompt length:', imagePrompt.length);

    const result = await getOpenAIClient().images.generate({
      model: 'gpt-image-1',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });

    // gpt-image-1 returns base64 by default
    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error('No image data returned from GPT-4o');
    }

    // Return as a data URI so the frontend can display it directly
    const imageUrl = `data:image/png;base64,${b64}`;

    console.log('Preview image generated successfully (GPT-4o)');

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('Preview image generation error:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: err.issues.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    if (err instanceof Error) {
      if (err.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing API key' },
          { status: 500 }
        );
      }

      if (err.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      if (
        err.message.includes('content_policy') ||
        err.message.includes('safety')
      ) {
        return NextResponse.json(
          { error: 'Image generation was blocked by content policy. Try adjusting your selections.' },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Preview image generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
