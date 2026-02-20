'use client';

import { AITeamRecommendations } from '@/components/ai-team-recommendations';
import { useAuth } from '@/components/auth-provider';
import { getUserProfile } from '@/lib/firebase-services';
import { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AiMatchPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (authUser) {
        try {
          const profile = await getUserProfile(authUser.uid);
          if (profile) {
            setUser(profile);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [authUser, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">Please log in to see AI recommendations.</p>
      </div>
    );
  }

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
      <AITeamRecommendations user={user} />
    </div>
  );
}
