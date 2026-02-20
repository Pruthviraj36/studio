'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { getAllUsers, getUserProfile, getAllHackathons, createHackathon, updateHackathon, deleteHackathon, deleteUser } from '@/lib/firebase-services';
import { User, Hackathon } from '@/lib/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, Shield, Activity, Search, BarChart3, List, UserPlus, Trophy, Plus, Edit, Trash2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAnalytics } from '@/components/admin-analytics';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const registeredToday = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return users.filter(user => {
            if (!user.createdAt) return false;
            const dateObj = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
            return dateObj.toISOString().split('T')[0] === today;
        }).length;
    }, [users]);

    useEffect(() => {
        async function checkAdminAndFetchData() {
            if (authUser) {
                try {
                    const profile = await getUserProfile(authUser.uid);
                    if (!profile || profile.role !== 'admin') {
                        router.push('/discover');
                        return;
                    }
                    setAdminUser(profile);
                    const [allUsers, allHackathons] = await Promise.all([
                        getAllUsers(),
                        getAllHackathons()
                    ]);
                    setUsers(allUsers);
                    setHackathons(allHackathons);
                } catch (error) {
                    console.error('Error fetching admin data:', error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                router.push('/auth/login');
            }
        }
        checkAdminAndFetchData();
    }, [authUser, authLoading, router]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
    const [hackathonForm, setHackathonForm] = useState<Omit<Hackathon, 'id' | 'createdAt'>>({
        title: '',
        description: '',
        location: '',
        date: '',
        status: 'Upcoming',
        image: '',
        link: '',
        organizer: '',
    });

    const handleHackathonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingHackathon) {
                await updateHackathon(editingHackathon.id, hackathonForm);
                toast({ title: 'Hackathon Updated', description: 'Changes saved successfully.' });
            } else {
                await createHackathon(hackathonForm as any);
                toast({ title: 'Hackathon Created', description: 'New hackathon added successfully.' });
            }
            setIsDialogOpen(false);
            setEditingHackathon(null);
            setHackathonForm({
                title: '',
                description: '',
                location: '',
                date: '',
                status: 'Upcoming',
                image: '',
                link: '',
                organizer: '',
            });
            const allHackathons = await getAllHackathons();
            setHackathons(allHackathons);
        } catch (error) {
            console.error('Error saving hackathon:', error);
            toast({ title: 'Error', description: 'Failed to save hackathon.', variant: 'destructive' });
        }
    };

    const handleDeleteHackathon = async (id: string) => {
        if (confirm('Are you sure you want to delete this hackathon?')) {
            try {
                await deleteHackathon(id);
                toast({ title: 'Hackathon Deleted', description: 'Hackathon removed successfully.' });
                setHackathons(hackathons.filter(h => h.id !== id));
            } catch (error) {
                console.error('Error deleting hackathon:', error);
                toast({ title: 'Error', description: 'Failed to delete hackathon.', variant: 'destructive' });
            }
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (id === authUser?.uid) {
            toast({ title: 'Error', description: 'You cannot delete yourself.', variant: 'destructive' });
            return;
        }

        if (confirm('Are you sure you want to delete this user? This action is permanent and only removes their profile data.')) {
            try {
                await deleteUser(id);
                toast({ title: 'User Deleted', description: 'User profile removed successfully.' });
                setUsers(users.filter(u => u.id !== id));
            } catch (error) {
                console.error('Error deleting user:', error);
                toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
            }
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!adminUser) return null;

    return (
        <div className="container mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage users and monitor system activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Today</CardTitle>
                        <UserPlus className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{registeredToday}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Just you right now</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <List className="h-4 w-4" /> User Management
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Advanced Analytics
                    </TabsTrigger>
                    <TabsTrigger value="hackathons" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" /> Hackathons
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="font-headline">User Management</CardTitle>
                            <CardDescription>A list of all users registered on the platform.</CardDescription>
                            <div className="mt-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/200/200`} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.location}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/profile/${user.id}`)}
                                                        className="text-primary hover:text-primary hover:bg-primary/10"
                                                    >
                                                        View Profile
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={user.id === authUser?.uid}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <AdminAnalytics users={users} />
                </TabsContent>

                <TabsContent value="hackathons">
                    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">Hackathon Management</CardTitle>
                                <CardDescription>Add and manage hackathons for the community.</CardDescription>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => {
                                        setEditingHackathon(null);
                                        setHackathonForm({
                                            title: '',
                                            description: '',
                                            location: '',
                                            date: '',
                                            status: 'Upcoming',
                                            image: '',
                                            link: '',
                                            organizer: '',
                                        });
                                    }}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Hackathon
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[525px]">
                                    <DialogHeader>
                                        <DialogTitle>{editingHackathon ? 'Edit Hackathon' : 'Add New Hackathon'}</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for the hackathon. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleHackathonSubmit} className="space-y-4 py-4">
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input id="title" value={hackathonForm.title} onChange={e => setHackathonForm({ ...hackathonForm, title: e.target.value })} required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="organizer">Organizer</Label>
                                                <Input id="organizer" value={hackathonForm.organizer} onChange={e => setHackathonForm({ ...hackathonForm, organizer: e.target.value })} required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="date">Date</Label>
                                                    <Input id="date" type="date" value={hackathonForm.date} onChange={e => setHackathonForm({ ...hackathonForm, date: e.target.value })} required />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select value={hackathonForm.status} onValueChange={(v: any) => setHackathonForm({ ...hackathonForm, status: v })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Upcoming">Upcoming</SelectItem>
                                                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                                                            <SelectItem value="Completed">Completed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input id="location" value={hackathonForm.location} onChange={e => setHackathonForm({ ...hackathonForm, location: e.target.value })} required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="link">Link</Label>
                                                <Input id="link" type="url" value={hackathonForm.link} onChange={e => setHackathonForm({ ...hackathonForm, link: e.target.value })} required />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="image">Image URL</Label>
                                                <Input id="image" value={hackathonForm.image} onChange={e => setHackathonForm({ ...hackathonForm, image: e.target.value })} placeholder="https://..." />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description (Markdown supported)</Label>
                                                <Textarea id="description" value={hackathonForm.description} onChange={e => setHackathonForm({ ...hackathonForm, description: e.target.value })} required />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">{editingHackathon ? 'Save Changes' : 'Create Hackathon'}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Hackathon</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Organizer</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hackathons.map((h) => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">{h.title}</TableCell>
                                            <TableCell>{h.date?.toDate ? h.date.toDate().toLocaleDateString() : new Date(h.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={h.status === 'Upcoming' ? 'default' : h.status === 'Ongoing' ? 'secondary' : 'outline'}>
                                                    {h.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{h.organizer}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setEditingHackathon(h);
                                                        setHackathonForm({
                                                            title: h.title,
                                                            description: h.description,
                                                            location: h.location,
                                                            date: h.date?.toDate ? h.date.toDate().toISOString().split('T')[0] : new Date(h.date).toISOString().split('T')[0],
                                                            status: h.status,
                                                            image: h.image,
                                                            link: h.link,
                                                            organizer: h.organizer,
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteHackathon(h.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {hackathons.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No hackathons found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
