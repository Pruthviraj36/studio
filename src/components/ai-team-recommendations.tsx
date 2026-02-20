'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { getAITeamRecommendations } from '../app/actions';
import type { AITeamRecommendationsOutput } from '@/ai/flows/ai-team-recommendations-flow';
import type { User } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';

type AITeamRecommendationsProps = {
  user: User;
};

export function AITeamRecommendations({ user }: AITeamRecommendationsProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AITeamRecommendationsOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = () => {
    startTransition(async () => {
      setError(null);
      // Sanitize user object to remove non-plain fields like Firestore Timestamps
      const serializedUser = {
        ...user,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const { result, error } = await getAITeamRecommendations(serializedUser);
      if (error) {
        setError(error);
      } else {
        setResult(result);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!result && (
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border-2 border-dashed bg-white/20 dark:bg-black/20 backdrop-blur-sm">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold font-headline mb-2">Ready to find your squad?</h3>
          <p className="text-muted-foreground mb-6">Click the button below to get started.</p>
          <Button
            onClick={handleAnalysis}
            disabled={isPending}
            size="lg"
            className="rounded-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Teams...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-8 text-center text-destructive">
          <p>An error occurred: {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold font-headline text-center">Your Top Matches</h2>
          {result.recommendations.map((rec) => (
            <Card key={rec.teamId} className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className='font-headline'>{rec.teamName}</CardTitle>
                    <CardDescription className='pt-1'>Based on your profile and interests</CardDescription>
                  </div>
                  <div className='text-right'>
                    <p className='text-2xl font-bold text-primary'>{rec.matchScore}%</p>
                    <p className='text-xs text-muted-foreground'>Match Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={rec.matchScore} className="mb-4 h-2" />
                <p className="text-sm text-foreground">{rec.reasoning}</p>
                <Button className="mt-4">Request to Join</Button>
              </CardContent>
            </Card>
          ))}
          <div className="text-center pt-4">
            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className='bg-white/50 dark:bg-black/50'
            >
              Run Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
