'use client';

import { useState } from 'react';
import { Team, TeamMeeting } from '@/lib/types';
import { scheduleMeeting } from '@/lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarIcon, MapPin, Plus, ExternalLink } from 'lucide-react';
import { useAuth } from './auth-provider';

export function TeamMeetings({ team, onUpdate }: { team: Team; onUpdate: () => void }) {
    const { user: authUser } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');

    const isMember = team.members.some(m => m.id === authUser?.uid);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        try {
            await scheduleMeeting(team.id, {
                title,
                date,
                link,
                createdAt: new Date(),
            });
            setTitle('');
            setDate('');
            setLink('');
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error('Error scheduling meeting:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
                {isMember && (
                    <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"}>
                        {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Schedule</>}
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Schedule Meeting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meet-title">Title</Label>
                                <Input
                                    id="meet-title"
                                    placeholder="e.g. Sprint Planning"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meet-date">Date & Time</Label>
                                    <Input
                                        id="meet-date"
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meet-link">Meeting Link (Optional)</Label>
                                    <Input
                                        id="meet-link"
                                        placeholder="https://zoom.us/..."
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Schedule Meeting</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {team.meetings && team.meetings.length > 0 ? (
                    team.meetings.map((meeting) => (
                        <Card key={meeting.id} className="bg-white/10 dark:bg-black/10 backdrop-blur-md border hover:border-primary/30 transition-all">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{meeting.title}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {new Date(meeting.date).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {meeting.link && (
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={meeting.link} target="_blank" rel="noopener noreferrer">
                                            Join <ExternalLink className="ml-2 h-3 w-3" />
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        No meetings scheduled yet.
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper to keep icons consistent
function Clock({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
