import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { TeamCard } from '@/components/team-card';
import { currentUser, teams } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function TeamsPage() {
  const myTeams = teams.filter((team) =>
    team.members.some((member) => member.id === currentUser.id)
  );
  const discoverTeams = teams.filter(
    (team) => !team.members.some((member) => member.id === currentUser.id)
  );

  return (
    <div className="container mx-auto">
      <Tabs defaultValue="discover">
        <div className="flex items-center justify-between mb-8">
          <TabsList>
            <TabsTrigger value="discover">Discover Teams</TabsTrigger>
            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          </TabsList>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>
                  Assemble your dream team and start building the next big thing.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Team Name
                  </Label>
                  <Input id="name" placeholder="e.g., AI Avengers" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" placeholder="What is your team's mission?" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skills" className="text-right">
                    Skills Needed
                  </Label>
                  <Input id="skills" placeholder="e.g., React, Python, Figma" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="discover">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discoverTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="my-teams">
          {myTeams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-20 text-center backdrop-blur-sm">
                <h3 className="text-xl font-semibold font-headline">You're not on a team yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Join a team or create your own to get started.</p>
                <Button className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Team
                </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
