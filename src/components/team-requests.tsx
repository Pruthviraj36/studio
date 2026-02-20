'use client';

import { Team, User } from '@/lib/types';
import { approveJoinRequest, rejectJoinRequest } from '@/lib/firebase-services';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export function TeamRequests({ team, onUpdate }: { team: Team; onUpdate: () => void }) {
    const [processing, setProcessing] = useState<string | null>(null);

    const handleApprove = async (user: any) => {
        setProcessing(user.id);
        try {
            await approveJoinRequest(team.id, user);
            toast({ title: "Approved!", description: `${user.name} is now a member.` });
            onUpdate();
        } catch (error) {
            console.error('Error approving request:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (userId: string) => {
        setProcessing(userId);
        try {
            await rejectJoinRequest(team.id, userId);
            toast({ title: "Rejected", description: "Request has been removed." });
            onUpdate();
        } catch (error) {
            console.error('Error rejecting request:', error);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Join Requests</h2>

            <div className="grid gap-4">
                {team.pendingRequests && team.pendingRequests.length > 0 ? (
                    team.pendingRequests.map((req) => (
                        <Card key={req.id} className="bg-white/10 dark:bg-black/10 backdrop-blur-md border overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                            <AvatarImage src={`https://picsum.photos/seed/${req.avatar}/200/200`} />
                                            <AvatarFallback>{req.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-lg">{req.name}</h3>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {req.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {req.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{req.skills.length - 3}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => handleReject(req.id)}
                                            disabled={!!processing}
                                        >
                                            {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(req)}
                                            disabled={!!processing}
                                        >
                                            {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        No pending requests for this team.
                    </div>
                )}
            </div>
        </div>
    );
}
