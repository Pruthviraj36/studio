'use client';

import { useState } from 'react';
import { signUpUser } from '@/lib/firebase-services';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TagInput } from '@/components/ui/tag-input';
import { skills } from '@/lib/skills';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [skills_list, setSkillsList] = useState<string[]>([]);
    const [interests_list, setInterestsList] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            console.log('Attempting signup...');
            await signUpUser(email, password, {
                name,
                skills: skills_list,
                interests: interests_list
            });
            console.log('Signup successful, redirecting...');
            router.push('/discover');
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Failed to sign up.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Code className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Create an Account</CardTitle>
                    <CardDescription>Join the community of builders</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-white/50 dark:bg-black/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/50 dark:bg-black/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/50 dark:bg-black/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Your Skills</Label>
                            <TagInput
                                placeholder="Search or type and Enter..."
                                tags={skills_list}
                                setTags={setSkillsList}
                                suggestions={skills}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Interests</Label>
                            <TagInput
                                placeholder="Search or type and Enter..."
                                tags={interests_list}
                                setTags={setInterestsList}
                                suggestions={skills}
                            />
                        </div>
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-sm font-medium text-destructive">{error}</p>
                                {error.includes('PERMISSION_DENIED') && (
                                    <p className="text-xs mt-1 text-destructive/80">
                                        Tip: Ensure Cloud Firestore is enabled and rules allow writes.
                                    </p>
                                )}
                            </div>
                        )}
                        {loading && (
                            <p className="text-xs text-center text-muted-foreground animate-pulse">
                                This may take a moment if the database is initializing...
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
