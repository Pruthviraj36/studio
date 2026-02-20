'use client';

import { AIPortfolioAnalysis } from '@/components/ai-portfolio-analysis';
import dynamic from 'next/dynamic';
const GithubStats = dynamic(() => import('@/components/github-stats').then(mod => mod.GithubStats), { ssr: false });
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import { getUserProfile, updateUserProfile } from '@/lib/firebase-services';
import { User } from '@/lib/types';
import { Code, Github, Globe, Loader2, Mail, Pencil, Save, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cities } from '@/lib/cities';
import { skills } from '@/lib/skills';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { refreshGithubStats } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form states
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editExperience, setEditExperience] = useState<User['experience']>('Beginner');
  const [editAvatar, setEditAvatar] = useState('1');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');

  async function fetchProfile() {
    if (authUser) {
      try {
        const profile = await getUserProfile(authUser.uid);
        if (profile) {
          setUser(profile);
          setEditName(profile.name);
          setEditBio(profile.bio);
          setEditLocation(profile.location);
          setEditSkills(profile.skills || []);
          setEditInterests(profile.interests || []);
          setEditExperience(profile.experience || 'Beginner');
          setEditAvatar(profile.avatar || '1');
          setEditGithubUrl(profile.githubUrl || '');
          setEditWebsiteUrl(profile.websiteUrl || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    } else if (!authLoading) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [authUser, authLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !user) return;
    setUpdating(true);
    try {
      const updates = {
        name: editName,
        bio: editBio,
        location: editLocation,
        skills: editSkills,
        interests: editInterests,
        experience: editExperience,
        avatar: editAvatar,
        githubUrl: editGithubUrl,
        websiteUrl: editWebsiteUrl,
      };
      await updateUserProfile(authUser.uid, updates);
      setIsEditDialogOpen(false);
      fetchProfile();
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error saving your changes.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRefreshStats = async () => {
    if (!authUser || !user?.githubUrl) return;
    setRefreshing(true);
    try {
      const result = await refreshGithubStats(authUser.uid, user.githubUrl);
      if (result.success) {
        toast({
          title: "Stats Refreshed",
          description: "Your GitHub snapshot has been updated with real-time data.",
        });
        fetchProfile();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error refreshing stats:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Could not fetch GitHub data. check your URL.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <p className="text-muted-foreground">Please make sure you are logged in.</p>
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
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4 w-full bg-white/50 dark:bg-black/50">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your personal information and skills.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">Location</Label>
                        <div className="col-span-3">
                          <Input
                            id="location"
                            list="cities-list"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            required
                          />
                          <datalist id="cities-list">
                            {cities.map(city => (
                              <option key={city} value={city} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="experience" className="text-right">Experience</Label>
                        <div className="col-span-3">
                          <Select
                            value={editExperience}
                            onValueChange={(value: any) => setEditExperience(value)}
                          >
                            <SelectTrigger id="experience">
                              <SelectValue placeholder="Select experience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="Expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">Bio</Label>
                        <Textarea id="bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="githubUrl" className="text-right">GitHub URL</Label>
                        <Input id="githubUrl" value={editGithubUrl} onChange={(e) => setEditGithubUrl(e.target.value)} placeholder="https://github.com/username" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="websiteUrl" className="text-right">Website</Label>
                        <Input id="websiteUrl" value={editWebsiteUrl} onChange={(e) => setEditWebsiteUrl(e.target.value)} placeholder="https://yourportfolio.com" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avatar" className="text-right">Avatar Seed</Label>
                        <div className="col-span-3 grid grid-cols-5 gap-2">
                          {['1', '2', '3', '4', '5'].map((seed) => (
                            <button
                              key={seed}
                              type="button"
                              onClick={() => setEditAvatar(seed)}
                              className={`relative h-12 w-12 rounded-lg border-2 transition-all ${editAvatar === seed ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                                }`}
                            >
                              <img
                                src={`https://picsum.photos/seed/${seed}/100/100`}
                                alt={`Seed ${seed}`}
                                className="h-full w-full rounded-md object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="skills" className="text-right pt-2">Skills</Label>
                        <div className="col-span-3">
                          <TagInput
                            placeholder="Type a skill and press Enter..."
                            tags={editSkills}
                            setTags={setEditSkills}
                            suggestions={skills}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="interests" className="text-right pt-2">Interests</Label>
                        <div className="col-span-3">
                          <TagInput
                            placeholder="Type an interest and press Enter..."
                            tags={editInterests}
                            setTags={setEditInterests}
                            suggestions={skills}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={updating}>
                        {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
          <GithubStats
            stats={user.githubStats}
            onRefresh={handleRefreshStats}
            isRefreshing={refreshing}
          />
          <AIPortfolioAnalysis user={user} />
        </div>
      </div>
    </div>
  );
}
