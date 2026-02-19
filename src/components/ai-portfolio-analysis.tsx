'use client';

import { useState, useTransition } from 'react';
import { getAIPortfolioAnalysis } from '@/app/actions';
import type { AIPortfolioAnalysisOutput } from '@/ai/flows/ai-portfolio-analysis-flow';
import type { User } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Bot, CheckCircle, Lightbulb, Loader2, Target } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type AIPortfolioAnalysisProps = {
  user: User;
};

export function AIPortfolioAnalysis({ user }: AIPortfolioAnalysisProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AIPortfolioAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = () => {
    startTransition(async () => {
      setError(null);
      const { result, error } = await getAIPortfolioAnalysis(user);
      if (error) {
        setError(error);
      } else {
        setResult(result);
      }
    });
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
           <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    
    if (result) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold font-headline flex items-center gap-2 mb-2"><CheckCircle className='text-green-500' /> Key Strengths</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline flex items-center gap-2 mb-2"><Target className='text-blue-500'/> Recommended Roles</h3>
             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {result.recommendedRoles.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline flex items-center gap-2 mb-2"><Lightbulb className='text-yellow-500'/> Project Suggestions & Skill Gaps</h3>
             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {result.skillGaps.map((g, i) => <li key={i}>{g}</li>)}
              {result.projectSuggestions.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
           <div className="text-center pt-4">
              <Button
                onClick={() => setResult(null)}
                variant="outline"
                className='bg-white/50 dark:bg-black/50'
              >
                Run Analysis Again
              </Button>
            </div>
        </div>
      );
    }
    
    return (
         <div className="text-center">
            <p className="text-muted-foreground mb-4">Get AI-powered insights on your developer profile.</p>
            <Button onClick={handleAnalysis} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
             {error && <p className="text-destructive text-sm mt-4">{error}</p>}
         </div>
    );
  }

  return (
    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="font-headline text-lg">AI Portfolio Insights</CardTitle>
        <CardDescription>
          Strengths, recommended roles, and areas for improvement based on your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
