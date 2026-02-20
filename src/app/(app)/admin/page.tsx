'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { getAllUsers, getUserProfile } from '@/lib/firebase-services';
import { User } from '@/lib/types';
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
import { Loader2, Users, Shield, Activity, Search, BarChart3, List, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAnalytics } from '@/components/admin-analytics';

export default function AdminPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
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
                    const allUsers = await getAllUsers();
                    setUsers(allUsers);
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
                                                <button
                                                    onClick={() => router.push(`/profile/${user.id}`)}
                                                    className="text-sm font-medium text-primary hover:underline"
                                                >
                                                    View Profile
                                                </button>
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
            </Tabs>
        </div>
    );
}
