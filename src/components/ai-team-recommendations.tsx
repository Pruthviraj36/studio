
import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { getAITeamRecommendations } from '../app/actions';
import type { AITeamRecommendationsOutput } from '@/ai/flows/ai-team-recommendations-flow';
import type { User } from '@/lib/types';
import { Loader2, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/responsive';

type AITeamRecommendationsProps = {
  user: User;
};

export function AITeamRecommendations({ user }: AITeamRecommendationsProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AITeamRecommendationsOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

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
    <div className={`w-full ${isMobile ? "max-w-full space-y-6 pb-10" : "max-w-4xl mx-auto space-y-8 pb-20"}`}>
      {!result && (
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-1 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
          <div className={`relative flex flex-col items-center justify-center text-center ${isMobile ? "p-6 rounded-[22px]" : "p-10 rounded-[22px]"} bg-background/60 backdrop-blur-md`}>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            <div className={`relative z-10 ${isMobile ? "p-3" : "p-5"} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg shadow-purple-500/30 animate-bounce-slow`}>
              <Sparkles className={isMobile ? "h-8 w-8 text-white" : "h-12 w-12 text-white"} />
            </div>

            <h3 className={`relative z-10 font-bold font-headline mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ${isMobile ? "text-2xl" : "text-3xl"}`}>
              Find Your Dream Team
            </h3>

            <p className={`relative z-10 text-muted-foreground max-w-md mb-8 ${isMobile ? "text-sm" : "text-lg"}`}>
              Unlock your potential by joining the perfect squad. Our AI analyzes your unique skills and interests to find the best match.
            </p>

            <Button
              onClick={handleAnalysis}
              disabled={isPending}
              size={isMobile ? "default" : "lg"}
              className={`relative z-10 font-semibold rounded-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-none ${isMobile ? "text-sm px-6 py-4" : "text-base px-8 py-6"}`}
            >
              {isPending ? (
                <>
                  <Loader2 className={`mr-2 animate-spin ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                  {isMobile ? "Analyzing..." : "Analyzing Profile..."}
                </>
              ) : (
                <>
                  <Sparkles className={`mr-2 ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                  {isMobile ? "Generate" : "Generate Recommendations"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h4 className="text-lg font-semibold text-red-500 mb-1">Analysis Failed</h4>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setError(null)} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className={`${isMobile ? "flex-col space-y-4" : "flex items-center justify-between gap-4"}`}>
            <div>
              <h2 className={`font-bold font-headline tracking-tight ${isMobile ? "text-2xl" : "text-3xl"}`}>Top Matches Found</h2>
              <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>We found {result.recommendations.length} teams that align with your goals.</p>
            </div>
            <Button
              onClick={() => setResult(null)}
              variant="outline"
              className={`rounded-full ${isMobile ? "w-full sm:w-auto" : ""}`}
            >
              Start Over
            </Button>
          </div>

          <div className="grid gap-6">
            {result.recommendations.map((rec, index) => (
              <Card
                key={rec.teamId}
                className={cn(
                  "group relative overflow-hidden border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10",
                  "animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                )}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${isMobile ? "hidden" : ""}`}>
                  <Trophy className="h-32 w-32 -rotate-12 translate-x-8 -translate-y-8" />
                </div>

                <CardHeader className={`relative ${isMobile ? "pb-4" : "pb-2"}`}>
                  <div className={`flex ${isMobile ? "flex-col gap-3" : "md:flex-row md:items-start md:justify-between gap-4"}`}>
                    <div className="space-y-1 min-w-0">
                      <div className={`flex ${isMobile ? "flex-wrap gap-2" : "items-center gap-2"}`}>
                        <CardTitle className={`font-bold font-headline group-hover:text-primary transition-colors ${isMobile ? "text-xl" : "text-2xl"}`}>
                          {rec.teamName}
                        </CardTitle>
                        {rec.matchScore >= 90 && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> Best Match
                          </Badge>
                        )}
                      </div>
                      <CardDescription className={isMobile ? "text-xs" : ""}> Ideally suited for your skills </CardDescription>
                    </div>

                    <div className={`flex items-center gap-3 bg-background/50 backdrop-blur-sm p-2 rounded-xl border border-white/5 ${isMobile ? "w-full sm:w-auto justify-between sm:justify-normal" : ""}`}>
                      <div className={isMobile ? "flex-1" : "text-right"}>
                        <p className={`font-medium text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>Compatibility</p>
                        <p className={cn(
                          "tabular-nums tracking-tight",
                          rec.matchScore >= 80 ? "text-green-500" : rec.matchScore >= 60 ? "text-yellow-500" : "text-input",
                          isMobile ? "text-xl font-black" : "text-2xl font-black"
                        )}>
                          {rec.matchScore}%
                        </p>
                      </div>
                      <div className="relative h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <svg className="h-full w-full -rotate-90 text-background" viewBox="0 0 36 36">
                          <path
                            className="text-muted/20"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className={cn(
                              "transition-all duration-1000 ease-out",
                              rec.matchScore >= 80 ? "text-green-500" : rec.matchScore >= 60 ? "text-yellow-500" : "text-primary"
                            )}
                            strokeDasharray={`${rec.matchScore}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={`relative space-y-4 ${isMobile ? "px-4 py-3" : ""}`}>
                  <div className={`p-4 rounded-xl bg-muted/30 border border-white/5 text-sm leading-relaxed text-foreground/90 shadow-inner ${isMobile ? "text-xs" : ""}`}>
                    <p>{rec.reasoning}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-muted-foreground uppercase tracking-wider ${isMobile ? "text-xs" : "text-xs"}`}>Match Strength</p>
                    <Progress
                      value={rec.matchScore}
                      className={`flex-1 bg-muted/50 ${isMobile ? "h-1" : "h-1.5"}`}
                      indicatorClassName={cn(
                        "transition-all duration-1000",
                        rec.matchScore >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                          rec.matchScore >= 60 ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
                            "bg-primary"
                      )}
                    />
                  </div>
                </CardContent>

                <CardFooter className="relative pt-2">
                  <Button className={`group/btn rounded-full bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 ${isMobile ? "w-full" : "w-full sm:w-auto ml-auto"}`}>
                    Request to Join Team
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
