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
import { ResponsiveGrid, ResponsiveContainer } from '@/components/mobile-optimized-layout';
import { useIsMobile } from '@/lib/responsive';
import { MobileTouchInput, MobileForm } from '@/components/mobile-form-optimized';

export default function TeamsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
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
    <ResponsiveContainer maxWidth="lg" padding={isMobile ? "px-4 py-4" : "px-6 py-8"}>
      <Tabs defaultValue="discover">
        <div className={isMobile ? "space-y-4" : "flex items-center justify-between mb-8"}>
          <TabsList className={isMobile ? "w-full" : ""}>
            <TabsTrigger value="discover" className={isMobile ? "flex-1" : ""}>Discover Teams</TabsTrigger>
            <TabsTrigger value="my-teams" className={isMobile ? "flex-1" : ""}>My Teams</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className={isMobile ? "w-full" : ""}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? "w-[95vw]" : "sm:max-w-[425px]"}>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>
                  Assemble your dream team and start building the next big thing.
                </DialogDescription>
              </DialogHeader>
              <MobileForm onSubmit={handleCreateTeam}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Team Name</Label>
                    <MobileTouchInput
                      id="name"
                      placeholder="e.g., AI Avengers"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What is your team's mission?"
                      value={newTeamDesc}
                      onChange={(e) => setNewTeamDesc(e.target.value)}
                      className="min-h-24"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills Needed</Label>
                    <TagInput
                      placeholder="Search or type and Enter..."
                      tags={newTeamSkills}
                      setTags={setNewTeamSkills}
                      suggestions={skills}
                    />
                  </div>
                </div>
                <div className={isMobile ? "flex gap-2 mt-6" : "flex justify-end gap-4 mt-6"}>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className={isMobile ? "flex-1" : ""}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className={isMobile ? "flex-1" : ""}
                  >
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {creating ? 'Creating...' : 'Create Team'}
                  </Button>
                </div>
              </MobileForm>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="discover">
          <ResponsiveGrid 
            mobileColumns={1} 
            tabletColumns={2} 
            desktopColumns={3} 
            gap="gap-6"
          >
            {discoverTeams.map((team) => (
              <TeamCard key={team.id} team={team} onUpdate={fetchTeamsAndProfile} />
            ))}
          </ResponsiveGrid>
        </TabsContent>
        <TabsContent value="my-teams">
          {myTeams.length > 0 ? (
            <ResponsiveGrid 
              mobileColumns={1} 
              tabletColumns={2} 
              desktopColumns={3} 
              gap="gap-6"
            >
              {myTeams.map((team) => (
                <TeamCard key={team.id} team={team} onUpdate={fetchTeamsAndProfile} />
              ))}
            </ResponsiveGrid>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-12 md:py-20 text-center backdrop-blur-sm px-4">
              <h3 className="text-lg md:text-xl font-semibold font-headline">You're not on a team yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Join a team or create your own to get started.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Team
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
}
