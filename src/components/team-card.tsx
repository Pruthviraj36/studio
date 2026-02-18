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

type TeamCardProps = {
  team: Team;
};

export function TeamCard({ team }: TeamCardProps) {
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
      <p className="mb-4 flex-grow text-sm text-muted-foreground">
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
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-medium">{team.members.length} member{team.members.length !== 1 && 's'}</span>
        <Button variant="outline" className='bg-white/50 dark:bg-black/50'>
          Request to Join <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
