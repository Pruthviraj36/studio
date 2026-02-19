import { AITeamRecommendations } from '@/components/ai-team-recommendations';
import { currentUser } from '@/lib/data';

export default function AiMatchPage() {
  return (
    <div className="container mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight lg:text-4xl">
          Find Your Perfect Team with AI
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Let our AI analyze your profile and suggest the best teams for you to join based on your skills, interests, and project goals.
        </p>
      </div>
      <AITeamRecommendations user={currentUser} />
    </div>
  );
}
