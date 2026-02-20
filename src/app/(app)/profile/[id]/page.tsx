'use client';

import { AIPortfolioAnalysis } from '@/components/ai-portfolio-analysis';
import dynamic from 'next/dynamic';
const GithubStats = dynamic(() => import('@/components/github-stats').then(mod => mod.GithubStats), { ssr: false });
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProfile } from '@/lib/firebase-services';
import { User } from '@/lib/types';
import { Code, Github, Globe, Loader2, Mail, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (id && typeof id === 'string') {
                // If viewing own profile, redirect to main profile
                if (id === authUser?.uid) {
                    router.push('/profile');
                    return;
                }

                try {
                    const profile = await getUserProfile(id);
                    if (profile) {
                        setUser(profile);
                    }
                } catch (error) {
                    console.error('Error fetching public profile:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchProfile();
    }, [id, authUser, router]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">User not found</h2>
                <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
                <Button className="mt-4" onClick={() => router.push('/discover')}>Back to Discovery</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-8">
                    {/* Profile Card */}
                    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                        <CardContent className="p-6 text-center">
                            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary/50">
                                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/200/200`} />
                                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <span>{user.location}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">{user.experience || 'Beginner'}</Badge>
                            </div>
                            <p className="mt-4 text-sm">{user.bio}</p>

                            <Button
                                className="mt-6 w-full"
                                onClick={() => router.push(`/chat?userId=${user.id}`)}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" /> Message
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Skills Card */}
                    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Skills & Interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-sm mb-2">Top Skills</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {user.skills.map(skill => <Badge key={skill} variant="secondary" className='bg-primary/10 text-primary border-primary/20'>{skill}</Badge>)}
                            </div>
                            <h3 className="font-semibold text-sm mb-2">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map(interest => <Badge key={interest} variant="outline">{interest}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/20 dark:bg-black/20 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Socials</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user.githubUrl && (
                                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                    <Github className="h-5 w-5 text-muted-foreground" />
                                    <span>{user.githubUrl.replace('https://', '')}</span>
                                </a>
                            )}
                            <a href={`mailto:${user.email}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <span>{user.email}</span>
                            </a>
                            {user.websiteUrl && (
                                <a href={user.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <span>{user.websiteUrl.replace('https://', '').replace('http://', '')}</span>
                                </a>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <GithubStats stats={user.githubStats} />
                    <AIPortfolioAnalysis user={user} />
                </div>
            </div>
        </div>
    );
}
