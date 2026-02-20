'use client';

import { useState } from 'react';
import { Team, TeamTask } from '@/lib/types';
import { addTaskToTeam } from '@/lib/firebase-services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, CheckCircle2, Clock, Circle } from 'lucide-react';
import { useAuth } from './auth-provider';

export function TeamTasks({ team, onUpdate }: { team: Team; onUpdate: () => void }) {
    const { user: authUser } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const isMember = team.members.some(m => m.id === authUser?.uid);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            await addTaskToTeam(team.id, {
                title,
                description: desc,
                status: 'Todo',
                createdAt: new Date(),
            });
            setTitle('');
            setDesc('');
            setIsAdding(false);
            onUpdate();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Done': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'In Progress': return <Clock className="h-4 w-4 text-amber-500" />;
            default: return <Circle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Tasks</h2>
                {isMember && (
                    <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"}>
                        {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Task</>}
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Create Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="task-title">Task Title</Label>
                                <Input
                                    id="task-title"
                                    placeholder="What needs to be done?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="task-desc">Description (Optional)</Label>
                                <Input
                                    id="task-desc"
                                    placeholder="Details..."
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <Button type="submit" className="w-full">Create Task</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {team.tasks && team.tasks.length > 0 ? (
                    team.tasks.map((task) => (
                        <Card key={task.id} className="bg-white/10 dark:bg-black/10 backdrop-blur-md border hover:border-primary/30 transition-all">
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(task.status)}
                                    <div>
                                        <h3 className="font-medium">{task.title}</h3>
                                        <p className="text-xs text-muted-foreground">{task.description}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="capitalize">{task.status}</Badge>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        No tasks found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
