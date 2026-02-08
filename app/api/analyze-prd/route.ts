import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import {
  WEBSITE_TYPES,
  STYLE_OPTIONS,
  LAYOUT_OPTIONS,
  COMPONENT_OPTIONS,
} from '@/constants/wizard-options';
import type { ComponentOption } from '@/lib/types';

// Lazy-initialize OpenAI client (avoid build-time errors when env var is missing)
function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Request validation schema
const RequestSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

// Response validation schema
const ResponseSchema = z.object({
  websiteType: z.string(),
  styleId: z.string(),
  layoutId: z.string(),
  componentIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const { content } = RequestSchema.parse(body);

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Prepare system prompt with available options
    const systemPrompt = `You are an expert at analyzing website project requirements and extracting structured information.

Available options:

Website Types: ${WEBSITE_TYPES.map((t) => t.id).join(', ')}

Visual Styles: ${STYLE_OPTIONS.map((s) => `${s.id} (${s.name})`).join(', ')}

Layouts: ${LAYOUT_OPTIONS.map((l) => `${l.id} (${l.name})`).join(', ')}

Components: ${COMPONENT_OPTIONS.map((c) => c.id).join(', ')}

Analyze the provided project description and return a JSON object with:
1. websiteType: Choose the most appropriate type from the list above
2. styleId: Choose the most appropriate style ID from the list above
3. layoutId: Choose the most appropriate layout ID from the list above
4. componentIds: Array of component IDs that are mentioned or implied
5. confidence: A number between 0 and 1 indicating how confident you are in the analysis
6. reasoning: (optional) Brief explanation of your choices

Return ONLY valid JSON matching this structure. Be conservative with componentIds - only include components explicitly mentioned or strongly implied.`;

    const userPrompt = `Analyze this website project description:\n\n${content}`;

    // Call OpenAI API
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse and validate AI response
    const parsed = JSON.parse(aiResponse);
    const validated = ResponseSchema.parse(parsed);

    // Map IDs to full objects
    const websiteType = WEBSITE_TYPES.find((t) => t.id === validated.websiteType)?.id;
    const style = STYLE_OPTIONS.find((s) => s.id === validated.styleId);
    const layout = LAYOUT_OPTIONS.find((l) => l.id === validated.layoutId);
    const components = validated.componentIds
      .map((id) => COMPONENT_OPTIONS.find((c) => c.id === id))
      .filter((c): c is ComponentOption => c !== undefined);

    if (!websiteType || !style || !layout) {
      throw new Error('Invalid AI response: Missing required fields');
    }

    // Return analysis result
    return NextResponse.json({
      websiteType,
      style,
      layout,
      components,
      confidence: validated.confidence,
      reasoning: validated.reasoning,
    });
  } catch (err) {
    console.error('Analysis error:', err);

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
      // Check for OpenAI-specific errors
      if (err.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing API key' },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
