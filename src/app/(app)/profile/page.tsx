'use client';
import { AIPortfolioAnalysis } from '@/components/ai-portfolio-analysis';
import dynamic from 'next/dynamic';
const GithubStats = dynamic(() => import('@/components/github-stats').then(mod => mod.GithubStats), { ssr: false });
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/lib/data';
import { Github, Globe, Mail, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const user = currentUser;

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
              <p className="text-muted-foreground">{user.location}</p>
              <p className="mt-4 text-sm">{user.bio}</p>
              <Button variant="outline" className="mt-4 w-full bg-white/50 dark:bg-black/50">
                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
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
            <CardContent className="space-y-2">
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary">
                <Github className="h-5 w-5 text-muted-foreground" />
                <span>{user.githubUrl.replace('https://', '')}</span>
              </a>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{user.name.toLowerCase().replace(' ', '.')}@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span>personal-website.com</span>
              </div>
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
