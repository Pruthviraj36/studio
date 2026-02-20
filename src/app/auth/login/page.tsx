'use client';

import { useState } from 'react';
import { signInUser } from '@/lib/firebase-services';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MobileTouchInput, MobileForm } from '@/components/mobile-form-optimized';
import { useIsMobile } from '@/lib/responsive';

export default function LoginPage() {
    const isMobile = useIsMobile();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInUser(email, password);
            router.push('/discover');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-2xl">
                <CardHeader className={isMobile ? "space-y-2 text-center p-4" : "space-y-2 text-center"}>
                    <div className="flex justify-center mb-3">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Code className={isMobile ? "h-8 w-8 text-primary" : "h-10 w-10 text-primary"} />
                        </div>
                    </div>
                    <CardTitle className={isMobile ? "text-2xl font-bold font-headline" : "text-3xl font-bold font-headline"}>Welcome Back</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Enter your credentials to access HackConnect</CardDescription>
                </CardHeader>
                <MobileForm onSubmit={handleLogin}>
                    <CardContent className={isMobile ? "space-y-4 p-4" : "space-y-4"}>
                        <MobileTouchInput
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <MobileTouchInput
                            id="password"
                            type="password"
                            label="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded">{error}</p>
                        )}
                    </CardContent>
                    <CardFooter className={isMobile ? "flex flex-col gap-3 p-4" : "flex flex-col gap-4"}>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <p className="text-xs md:text-sm text-center text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="text-primary hover:underline font-semibold">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </MobileForm>
            </Card>
        </div>
    );
}
