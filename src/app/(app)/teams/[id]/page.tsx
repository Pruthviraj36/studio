'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTeam, getUserProfile } from '@/lib/firebase-services';
import { Team, User } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, CheckSquare, Users, Info, Settings } from 'lucide-react';
import { TeamTasks } from '@/components/team-tasks';
import { TeamMeetings } from '@/components/team-meetings';
import { TeamRequests } from '@/components/team-requests';

export default function TeamDetailPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { user: authUser } = useAuth();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

    const fetchTeam = async () => {
        if (!id) return;
        try {
            const teamData = await getTeam(id as string);
            setTeam(teamData);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!team) {
        return <div className="p-8 text-center text-muted-foreground">Team not found</div>;
    }

    const isLead = team.createdBy === authUser?.uid;

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-4xl font-bold font-headline mb-2">{team.name}</h1>
                    <div className="flex flex-wrap gap-2">
                        {team.requiredSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex -space-x-3 overflow-hidden p-1">
                    {team.members.map((member) => (
                        <Avatar key={member.id} className="h-10 w-10 border-2 border-background ring-2 ring-primary/20">
                            <AvatarImage src={`https://picsum.photos/seed/${member.avatar}/200/200`} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px] h-12 bg-white/20 dark:bg-black/20 backdrop-blur-md border">
                    <TabsTrigger value="overview" className="gap-2 h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <Info className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="gap-2 h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <CheckSquare className="h-4 w-4" /> Tasks
                    </TabsTrigger>
                    <TabsTrigger value="meetings" className="gap-2 h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                        <Calendar className="h-4 w-4" /> Meetings
                    </TabsTrigger>
                    {isLead && (
                        <TabsTrigger value="requests" className="gap-2 h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                            <Users className="h-4 w-4" /> Requests
                            {team.pendingRequests && team.pendingRequests.length > 0 && (
                                <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                                    {team.pendingRequests.length}
                                </span>
                            )}
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 bg-white/20 dark:bg-black/20 backdrop-blur-md border-primary/10">
                            <CardHeader>
                                <CardTitle>Project Vision</CardTitle>
                                <CardDescription>What we are building together</CardDescription>
                            </CardHeader>
                            <CardContent className="prose dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{team.projectDescription || team.description}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md border-primary/10">
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>{team.members.length} contributors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {team.members.map(member => (
                                        <div key={member.id} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://picsum.photos/seed/${member.avatar}/200/200`} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.name}</p>
                                                {member.id === team.createdBy && (
                                                    <p className="text-[10px] text-primary font-bold tracking-wider uppercase">Team Lead</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="tasks">
                    <TeamTasks team={team} onUpdate={fetchTeam} />
                </TabsContent>

                <TabsContent value="meetings">
                    <TeamMeetings team={team} onUpdate={fetchTeam} />
                </TabsContent>

                {isLead && (
                    <TabsContent value="requests">
                        <TeamRequests team={team} onUpdate={fetchTeam} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
