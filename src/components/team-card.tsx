'use client';

import type { Team } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

import { useAuth } from './auth-provider';
import { requestToJoinTeam, getUserProfile } from '@/lib/firebase-services';
import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type TeamCardProps = {
  team: Team;
  onUpdate?: () => void;
};

export function TeamCard({ team, onUpdate }: TeamCardProps) {
  const { user: authUser } = useAuth();
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  const isMember = team.members.some(m => m.id === authUser?.uid);
  const hasRequested = team.pendingRequests?.some(r => r.id === authUser?.uid);

  const handleJoinRequest = async () => {
    if (!authUser) return;
    setJoining(true);
    try {
      const profile = await getUserProfile(authUser.uid);
      if (profile) {
        await requestToJoinTeam(team.id, {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          skills: profile.skills,
        });
        toast({
          title: "Request Sent",
          description: `Your request to join ${team.name} has been sent to the team lead.`,
        });
        onUpdate?.();
      }
    } catch (error: any) {
      console.error('Error joining team:', error);
      toast({
        title: "Request Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white/20 p-6 shadow-lg dark:bg-black/20 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold font-headline">{team.name}</h3>
        <div className="flex -space-x-2 overflow-hidden">
          <TooltipProvider>
            {team.members.map((member) => (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${member.avatar}/200/200`}
                      alt={member.name}
                    />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{member.name}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <p className="mb-4 flex-grow text-sm text-muted-foreground line-clamp-2">
        {team.description}
      </p>
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-semibold">Skills Needed</h4>
        <div className="flex flex-wrap gap-2">
          {team.requiredSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className='bg-primary/10 text-primary border-primary/20'>
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{team.members.length} member{team.members.length !== 1 && 's'}</span>
        <div className="flex gap-2">
          {isMember ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push(`/teams/${team.id}`)}
              className="px-4"
            >
              View Team
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'bg-white/50 dark:bg-black/50',
                hasRequested && "text-green-600 border-green-200"
              )}
              onClick={handleJoinRequest}
              disabled={joining || hasRequested}
            >
              {joining ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : hasRequested ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : null}
              {hasRequested ? 'Request Sent' : 'Join Team'}
              {!joining && !hasRequested && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
