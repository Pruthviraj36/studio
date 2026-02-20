'use client';

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
import { useAuth } from '@/components/auth-provider';
import { getAllTeams, createTeam, getUserProfile } from '@/lib/firebase-services';
import { Team, User } from '@/lib/types';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TagInput } from '@/components/ui/tag-input';
import { skills } from '@/lib/skills';

export default function TeamsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamSkills, setNewTeamSkills] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function fetchTeamsAndProfile() {
    setLoading(true);
    try {
      const [allTeams, profile] = await Promise.all([
        getAllTeams(),
        authUser ? getUserProfile(authUser.uid) : Promise.resolve(null),
      ]);
      setTeams(allTeams);
      if (profile) setUser(profile);
    } catch (error) {
      console.error('Error fetching teams/profile:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchTeamsAndProfile();
    }
  }, [authUser, authLoading]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const teamData = {
        name: newTeamName,
        description: newTeamDesc,
        projectDescription: newTeamDesc, // Simplified for now
        requiredSkills: newTeamSkills,
        members: [{ id: user.id, name: user.name, avatar: user.avatar }],
        createdBy: user.id,
      };
      await createTeam(teamData);
      setIsDialogOpen(false);
      setNewTeamName('');
      setNewTeamDesc('');
      setNewTeamSkills([]);
      fetchTeamsAndProfile();
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myTeams = teams.filter((team) =>
    team.members.some((member) => member.id === user?.id)
  );
  const discoverTeams = teams.filter(
    (team) => !team.members.some((member) => member.id === user?.id)
  );

  return (
    <div className="container mx-auto">
      <Tabs defaultValue="discover">
        <div className="flex items-center justify-between mb-8">
          <TabsList>
            <TabsTrigger value="discover">Discover Teams</TabsTrigger>
            <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <form onSubmit={handleCreateTeam}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Team Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., AI Avengers"
                      className="col-span-3"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="What is your team's mission?"
                      className="col-span-3"
                      value={newTeamDesc}
                      onChange={(e) => setNewTeamDesc(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="skills" className="text-right pt-2">
                      Skills Needed
                    </Label>
                    <div className="col-span-3">
                      <TagInput
                        placeholder="Search or type and Enter..."
                        tags={newTeamSkills}
                        setTags={setNewTeamSkills}
                        suggestions={skills}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {creating ? 'Creating...' : 'Create Team'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="discover">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {discoverTeams.map((team) => (
              <TeamCard key={team.id} team={team} onUpdate={fetchTeamsAndProfile} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="my-teams">
          {myTeams.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} onUpdate={fetchTeamsAndProfile} />
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
