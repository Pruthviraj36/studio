"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import {
  Github,
  Globe,
  Mail,
  MapPin,
  Trophy,
  Zap,
  CheckCircle2,
  Users,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EnhancedProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function EnhancedProfileCard({
  user,
  isOwnProfile = false,
  onEdit,
}: EnhancedProfileCardProps) {
  const getExperienceColor = (exp: string) => {
    switch (exp) {
      case "Beginner":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "Intermediate":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      case "Advanced":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "Expert":
        return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Profile Card */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage
                    src={`https://picsum.photos/seed/${user.avatar}/200/200`}
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* Verified Badge */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.role === "admin" && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    className={cn(
                      "flex gap-1",
                      getExperienceColor(user.experience || "Beginner"),
                    )}
                  >
                    <Zap className="h-3 w-3" />
                    {user.experience || "Beginner"}
                  </Badge>
                  {user.location && (
                    <Badge variant="outline" className="flex gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location}
                    </Badge>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {user.email && (
                    <Button variant="ghost" size="sm" asChild className="h-8">
                      <a href={`mailto:${user.email}`}>
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </Button>
                  )}
                  {user.githubUrl && (
                    <Button variant="ghost" size="sm" asChild className="h-8">
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    </Button>
                  )}
                  {user.websiteUrl && (
                    <Button variant="ghost" size="sm" asChild className="h-8">
                      <a
                        href={user.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {isOwnProfile && onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {user.skills && user.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm cursor-default hover:bg-secondary/80"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Stats */}
      {user.githubStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              GitHub Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {user.githubStats.stars || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Stars</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {user.githubStats.forks || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Forks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {user.githubStats.languages?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {user.githubStats.topRepos?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Top Repos</p>
              </div>
            </div>

            {user.githubStats.languages &&
              user.githubStats.languages.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {user.githubStats.languages.slice(0, 5).map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                    {(user.githubStats.languages.length || 0) > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{(user.githubStats.languages.length || 0) - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Activity & Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary">
                {user.favorites?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">4</p>
              <p className="text-xs text-muted-foreground">Teams Joined</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
