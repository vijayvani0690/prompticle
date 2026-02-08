'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePromptStore } from '@/lib/store/prompt-store';
import { ChevronRight, FileText, Lightbulb } from 'lucide-react';

const EXAMPLE_BRIEFS = [
  {
    label: 'SaaS Landing Page',
    text: 'Build a modern SaaS landing page for "TaskFlow" — a project management tool for remote teams. It should feel professional yet approachable, with a hero section showcasing the product, feature highlights, pricing plans, and customer testimonials. Target audience: startup CTOs and team leads.',
  },
  {
    label: 'Photography Portfolio',
    text: 'Create a portfolio website for "Alex Chen Photography" — a lifestyle and event photographer. The site should feel creative and immersive, showcasing a gallery of work, an about section, pricing packages, and a contact form. The photography should be the star of the show.',
  },
  {
    label: 'E-Commerce Store',
    text: 'Design an online store for "Urban Threads" — a sustainable fashion brand targeting young professionals. It needs a product catalog with filtering, individual product pages, a shopping cart, and a clean checkout flow. The brand vibe is eco-friendly, minimal, and premium.',
  },
];

export function ProjectBriefStep() {
  const { prdInput, setPRDInput, nextStep } = usePromptStore();
  const [text, setText] = useState(prdInput || '');

  const handleNext = () => {
    setPRDInput(text.trim());
    nextStep();
  };

  const handleSkip = () => {
    setPRDInput('');
    nextStep();
  };

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Describe Your Project</h2>
        <p className="text-muted-foreground">
          Give a brief description so we can generate smarter, more relevant prompts.
          This is optional — you can skip and go straight to selections.
        </p>
      </div>

      {/* Input Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Project Brief
          </CardTitle>
          <CardDescription>
            What are you building? Who is it for? What should it feel like?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: Build a modern portfolio website for a freelance designer. It should feel clean and minimal, with a gallery of work, about section, and contact form. Target audience: potential clients in tech startups."
            className="min-h-[160px] resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{text.length} characters</span>
            <span>Optional — but helps generate better prompts</span>
          </div>
        </CardContent>
      </Card>

      {/* Example Briefs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lightbulb className="w-4 h-4" />
          <span>Try an example to get started:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EXAMPLE_BRIEFS.map((example) => (
            <Card
              key={example.label}
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
              onClick={() => handleExampleClick(example.text)}
            >
              <CardContent className="p-4">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {example.label}
                </Badge>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {example.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleNext}>
          {text.trim().length > 0 ? 'Continue' : 'Start Without Brief'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
