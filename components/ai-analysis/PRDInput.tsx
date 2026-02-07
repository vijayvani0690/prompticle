'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EXAMPLE_PRDS } from '@/constants/example-prds';
import { Sparkles, AlertCircle } from 'lucide-react';

interface PRDInputProps {
  onAnalyze: (content: string) => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
  currentValue: string;
}

export function PRDInput({ onAnalyze, isAnalyzing, error, currentValue }: PRDInputProps) {
  const [content, setContent] = useState(currentValue);

  const handleExampleClick = (exampleContent: string) => {
    setContent(exampleContent);
  };

  const canAnalyze = content.trim().length >= 10 && !isAnalyzing;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Paste Your Project Description</h2>
        <p className="text-muted-foreground">
          Describe your website project and let AI extract the requirements
        </p>
      </div>

      {/* Main Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Description (PRD)</CardTitle>
          <CardDescription>
            Paste your project requirements, description, or brief
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe your website project in detail...&#10;&#10;Include information about:&#10;• Type of website (e-commerce, portfolio, landing page, etc.)&#10;• Design style preferences&#10;• Required features and components&#10;• Target audience&#10;• Any specific requirements"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            disabled={isAnalyzing}
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {content.length} characters
              {content.length < 10 && ' (minimum 10 required)'}
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => onAnalyze(content)}
            disabled={!canAnalyze}
            size="lg"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Example PRDs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Or Try an Example</h3>
        <p className="text-sm text-muted-foreground">
          Click any example to auto-fill the textarea above
        </p>

        <div className="grid gap-3">
          {EXAMPLE_PRDS.map((example) => (
            <Card
              key={example.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => handleExampleClick(example.content)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{example.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {example.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{example.category}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
